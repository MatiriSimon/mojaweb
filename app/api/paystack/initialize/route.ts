import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initializePaystackTransaction } from "@/lib/paystack/paystack";
import { randomUUID } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000";

function redirectToDonation(campaignId: string, params: Record<string, string> = {}) {
  const url = new URL(`/campaigns/${encodeURIComponent(campaignId)}/donate`, APP_URL);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return NextResponse.redirect(url.toString());
}

export async function POST(request: Request) {
  let campaignId = "";

  try {
    const contentType = request.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await request.json().catch(() => ({}))
      : Object.fromEntries((await request.formData().catch(() => new FormData())).entries());

    campaignId = String(body.campaignId ?? "").trim();
    const amount = Number(body.amount ?? 0);
    const email = String(body.email ?? "").trim().toLowerCase();
    const donorName = String(body.donorName ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!campaignId || !amount || amount <= 0 || !email) {
      return redirectToDonation(campaignId, { error: "Campaign ID, amount and email are required." });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const standardName = donorName || user?.email?.split("@")[0] || "Anonymous Guest";

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, title")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return redirectToDonation(campaignId, { error: "Campaign not found." });
    }

    let donorId: string | null = null;

    if (user) {
      const { data: existingDonor } = await supabase
        .from("donors")
        .select("id")
        .eq("profiles_id", user.id)
        .maybeSingle();

      if (existingDonor) donorId = existingDonor.id;
      else {
        const { data: newDonor, error } = await supabase
          .from("donors")
          .insert({ profiles_id: user.id, full_name: standardName, email })
          .select("id")
          .single();
        if (error || !newDonor) return redirectToDonation(campaignId, { error: "Unable to create donor profile." });
        donorId = newDonor.id;
      }
    } else {
      const { data: guestDonor, error } = await supabase
        .from("donors")
        .insert({ profiles_id: null, full_name: standardName, email })
        .select("id")
        .single();
      if (error || !guestDonor) return redirectToDonation(campaignId, { error: "Unable to create guest donor profile." });
      donorId = guestDonor.id;
    }

    const reference = `MOJA-${randomUUID()}`;
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .insert({
        campaign_id: campaignId,
        donor_id: donorId,
        donor_name: standardName,
        campaign_title: campaign.title,
        amount,
        currency: "KES",
        gateway: "paystack",
        payment_status: "pending",
        message: message || null,
        gateway_transaction_id: reference,
      })
      .select("id")
      .single();

    if (donationError || !donation) {
      return redirectToDonation(campaignId, { error: donationError?.message ?? "Unable to create donation record." });
    }

    const callbackUrl = `${APP_URL.replace(/\/$/, "")}/api/paystack/callback`;
    const transaction = await initializePaystackTransaction({
      email,
      amount,
      currency: "KES",
      callbackUrl,
      reference,
      metadata: {
        donation_id: donation.id,
        campaign_id: campaignId,
        campaign_title: campaign.title,
        donor_name: standardName,
        message,
      },
    });

    return NextResponse.redirect(transaction.authorization_url);
  } catch (error) {
    console.error("Paystack initialization failed:", error);
    return redirectToDonation(campaignId, {
      error: error instanceof Error ? error.message : "Unable to initialize Paystack payment.",
    });
  }
}
