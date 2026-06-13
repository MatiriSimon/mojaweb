"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function donateCampaign(formData: FormData) {
  const campaign_id = String(formData.get("campaign_id") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const donor_name = String(formData.get("donor_name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!campaign_id || !amount || amount <= 0) {
    const url = new URL(`/campaigns/${campaign_id}/donate`, process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000");
    url.searchParams.set("error", "Please enter a valid donation amount.");
    redirect(url.toString());
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const url = new URL("/login", process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000");
    url.searchParams.set("redirectTo", `/campaigns/${campaign_id}/donate`);
    redirect(url.toString());
  }

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, current_amount")
    .eq("id", campaign_id)
    .single();

  if (campaignError || !campaign) {
    const url = new URL(`/campaigns/${campaign_id}/donate`, process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000");
    url.searchParams.set("error", "Campaign not found.");
    redirect(url.toString());
  }

  const { error: donationError } = await supabase
    .from("donations")
    .insert({
      campaign_id,
      donor_id: user.id,
      donor_name: donor_name || user.email || "Anonymous",
      amount,
      message,
    });

  if (donationError) {
    const url = new URL(`/campaigns/${campaign_id}/donate`, process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000");
    url.searchParams.set("error", donationError.message ?? "Donation could not be recorded.");
    redirect(url.toString());
  }

  const { error: updateError } = await supabase
    .from("campaigns")
    .update({ current_amount: Number(campaign.current_amount ?? 0) + amount })
    .eq("id", campaign_id);

  if (updateError) {
    const url = new URL(`/campaigns/${campaign_id}/donate`, process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000");
    url.searchParams.set("error", updateError.message ?? "Donation recorded, but campaign total could not be updated.");
    redirect(url.toString());
  }

  redirect(`/campaigns/${campaign_id}?success=true`);
}
