// the server endpoint your donation form calls to start payment.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initiateStkPush } from "@/lib/mpesa/client";

function buildRedirectPath(path: string, params: Record<string, string> = {}) {
  const url = new URL(path, "http://localhost:3000");
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
  if (!formData) {
    return {};
  }

  const entries = Object.fromEntries(formData.entries());
  return entries;
}

export async function POST(request: Request) {
  try {
    const body = await readRequestBody(request);
    const campaignId = String(body.campaignId ?? body.campaign_id ?? "").trim();
    const amount = Number(body.amount ?? 0);
    const phone = String(body.phone ?? "").trim();
    const donorName = String(body.donorName ?? body.donor_name ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!campaignId || !amount || amount <= 0 || !phone) {
      return NextResponse.redirect(new URL(buildRedirectPath(`/campaigns/${campaignId || ""}/donate`, { error: "Campaign ID, amount and phone number are required." }), "http://localhost:3000"));
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
          return NextResponse.redirect(new URL(buildRedirectPath(`/campaigns/${campaignId}/donate`, { error: "Unable to create donor profile." }), "http://localhost:3000"));
        }

        donorId = newDonor.id;
      }
    } else {
      const { data: guestDonor, error: guestError } = await supabase
        .from("donors")
        .insert({ profiles_id: null, full_name: standardName, email: null })
        .select("id")
        .single();

      if (guestError || !guestDonor) {
        return NextResponse.redirect(new URL(buildRedirectPath(`/campaigns/${campaignId}/donate`, { error: "Unable to create guest donor profile." }), "http://localhost:3000"));
      }

      donorId = guestDonor.id;
    }

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, title")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.redirect(new URL(buildRedirectPath(`/campaigns/${campaignId}/donate`, { error: "Campaign not found." }), "http://localhost:3000"));
    }

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
      return NextResponse.redirect(new URL(buildRedirectPath(`/campaigns/${campaignId}/donate`, { error: donationError?.message ?? "Unable to create donation record." }), "http://localhost:3000"));
    }

    const payment = await initiateStkPush({
      phone,
      amount,
      accountReference: campaignId,
      transactionDesc: `Donation for ${campaign.title}`,
    });

    if (!payment.ok) {
      return NextResponse.redirect(new URL(buildRedirectPath(`/campaigns/${campaignId}/donate`, { error: "Unable to start M-Pesa payment request." }), "http://localhost:3000"));
    }

    return NextResponse.redirect(new URL(buildRedirectPath(`/campaigns/${campaignId}/donate`, { success: "M-Pesa STK push initiated. Please complete the prompt on your phone." }), "http://localhost:3000"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.redirect(new URL(buildRedirectPath(`/campaigns/${campaignId}/donate`, { error: message }), "http://localhost:3000"));
  }
}
