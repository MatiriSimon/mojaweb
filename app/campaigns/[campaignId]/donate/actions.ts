"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function buildRedirectPath(path: string, params: Record<string, string> = {}) {
  const url = new URL(path, "http://localhost:3000");

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return `${url.pathname}${url.search}`;
}

export async function donateCampaign(formData: FormData) {
  const campaign_id = String(formData.get("campaign_id") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const donor_name = String(formData.get("donor_name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!campaign_id || !amount || amount <= 0) {
    redirect(
      buildRedirectPath(`/campaigns/${campaign_id}/donate`, {
        error: "Please enter a valid donation amount.",
      })
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      buildRedirectPath("/login", {
        redirectTo: `/campaigns/${campaign_id}/donate`,
      })
    );
  }

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, current_amount")
    .eq("id", campaign_id)
    .single();

  if (campaignError || !campaign) {
    redirect(
      buildRedirectPath(`/campaigns/${campaign_id}/donate`, {
        error: "Campaign not found.",
      })
    );
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
    redirect(
      buildRedirectPath(`/campaigns/${campaign_id}/donate`, {
        error: donationError.message ?? "Donation could not be recorded.",
      })
    );
  }

  const { error: updateError } = await supabase
    .from("campaigns")
    .update({ current_amount: Number(campaign.current_amount ?? 0) + amount })
    .eq("id", campaign_id);

  if (updateError) {
    redirect(
      buildRedirectPath(`/campaigns/${campaign_id}/donate`, {
        error: updateError.message ?? "Donation recorded, but campaign total could not be updated.",
      })
    );
  }

  redirect(`/campaigns/${campaign_id}?success=true`);
}


