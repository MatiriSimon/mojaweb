import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initiateStkPush, normalizePhoneNumber } from "@/lib/mpesa/client";

function buildRedirectPath(path: string, params: Record<string, string> = {}, baseUrl: string) {
  const url = new URL(path, baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return `${url.pathname}${url.search}`;
}

async function readRequestBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return request.json().catch(() => ({}));
  }
  const formData = await request.formData().catch(() => null);
  if (!formData) return {};
  return Object.fromEntries(formData.entries());
}

export async function POST(request: Request) {
  let campaignId = "";

  try {
    const headerStore = await headers();
    const forwardedHost = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
    const forwardedProto = headerStore.get("x-forwarded-proto") ?? "http";
    const baseUrl = `${forwardedProto}://${forwardedHost}`;

    const body = await readRequestBody(request);
    campaignId = String(body.campaignId ?? body.campaign_id ?? "").trim();
    const amount = Number(body.amount ?? 0);
    const phone = String(body.phone ?? "").trim();
    const donorName = String(body.donorName ?? body.donor_name ?? "").trim();
    const message = String(body.message ?? "").trim();
    const normalizedPhone = normalizePhoneNumber(phone);

    if (!campaignId || !amount || amount <= 0 || !normalizedPhone) {
      return NextResponse.redirect(new URL(buildRedirectPath(`/campaigns/${campaignId || ""}/donate`, { error: "Campaign ID, amount and phone number are required." }, baseUrl), baseUrl));
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let donorId: string | null = null;
    const standardName = donorName || user?.email?.split("@")[0] || "Anonymous Guest";

    if (user) {
      const { data: existingDonor } = await supabase.from("donors").select("id").eq("profiles_id", user.id).maybeSingle();
      if (existingDonor) {
        donorId = existingDonor.id;
      } else {
        const { data: newDonor, error: donorError } = await supabase
          .from("donors")
          .insert({ profiles_id: user.id, full_name: standardName, email: user.email })
          .select("id")
          .single();

        if (donorError || !newDonor) {
          return NextResponse.redirect(new URL(buildRedirectPath(`/campaigns/${campaignId}/donate`, { error: "Unable to create donor profile." }, baseUrl), baseUrl));
        }
        donorId = newDonor.id;
      }
    } else {
      const { data: guestDonor, error: guestError } = await supabase
        .from("donors")
        .insert({ profiles_id: null, full_name: standardName, email: null, phone_number: normalizedPhone })
        .select("id")
        .single();

      if (guestError || !guestDonor) {
        return NextResponse.redirect(new URL(buildRedirectPath(`/campaigns/${campaignId}/donate`, { error: "Unable to create guest donor profile." }, baseUrl), baseUrl));
      }
      donorId = guestDonor.id;
    }

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, title")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.redirect(new URL(buildRedirectPath(`/campaigns/${campaignId}/donate`, { error: "Campaign not found." }, baseUrl), baseUrl));
    }

    // 1. Create pending donation record
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .insert({
        campaign_id: campaignId,
        donor_id: donorId,
        donor_name: standardName,
        campaign_title: campaign.title,
        amount,
        currency: "KES",
        gateway: "mpesa",
        payment_status: "pending",
        message: message || null,
      })
      .select("id")
      .single();

    if (donationError || !donation) {
      return NextResponse.redirect(new URL(buildRedirectPath(`/campaigns/${campaignId}/donate`, { error: donationError?.message ?? "Unable to create donation record." }, baseUrl), baseUrl));
    }

    // 2. Fire STK push passing donation.id as the reference
    console.log("M-Pesa STK push request:", {
      phone: normalizedPhone,
      amount,
      accountReference: donation.id,
      transactionDesc: `Donation for ${campaign.title}`,
    });

    const payment = await initiateStkPush({
      phone: normalizedPhone,
      amount,
      accountReference: donation.id, // Fixed: Scoped tracking identifier
      transactionDesc: `Donation for ${campaign.title}`,
    });

    console.log("M-Pesa STK push response:", payment);
    if (payment.ok) {
      console.log("M-Pesa STK push succeeded:", payment.data);
    } else {
      console.log("M-Pesa STK push failed:", payment.status, payment.data);
    }

    if (!payment.ok || !payment.data?.CheckoutRequestID) {
      return NextResponse.redirect(new URL(buildRedirectPath(`/campaigns/${campaignId}/donate`, { error: "Unable to start M-Pesa payment request." }, baseUrl), baseUrl));
    }

    // 3. Save checkout tracking ID back into your donation row so status routes work
    await supabase
      .from("donations")
      .update({ checkout_request_id: payment.data.CheckoutRequestID })
      .eq("id", donation.id);

    // Pass checkoutRequestId over query params so your confirmation screen can poll your status api route!
    return NextResponse.redirect(new URL(buildRedirectPath(`/campaigns/${campaignId}/donate`, { 
      success: "M-Pesa STK push initiated.",
      checkoutRequestId: payment.data.CheckoutRequestID 
    }, baseUrl), baseUrl));

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("M-Pesa STK push failed:", error);
    return NextResponse.redirect(new URL(buildRedirectPath(`/campaigns/${campaignId || ""}/donate`, { error: message }, "http://localhost:3000"), "http://localhost:3000"));
  }
}