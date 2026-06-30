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
    redirect(buildRedirectPath(`/campaigns/${campaign_id}/donate`, { error: "Please enter a valid donation amount." }));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let finalDonorId: string | null = null;
  const standardName = donor_name || user?.email?.split("@")[0] || "Anonymous Guest";

  // --- STEP 1: RESOLVE OR CREATE DONOR PROFILE ---
  if (user) {
    // If user is logged in, check if they already have a profile in our custom 'donors' table
    const { data: existingDonor } = await supabase
      .from("donors")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingDonor) {
      finalDonorId = existingDonor.id;
    } else {
      // First-time logged-in donor: create their profile linked via user_id
      const { data: newDonor, error: donorErr } = await supabase
        .from("donors")
        .insert({
          user_id: user.id, // Authenticated Foreign Key matched here
          name: standardName,
          email: user.email
        })
        .select("id")
        .single();

      if (donorErr) redirect(buildRedirectPath(`/campaigns/${campaign_id}/donate`, { error: "Failed to set up your donor profile." }));
      finalDonorId = newDonor.id;
    }
  } else {
    // Guest User: Always create a fresh profile where user_id foreign key defaults to NULL
    const { data: guestDonor, error: guestErr } = await supabase
      .from("donors")
      .insert({
        user_id: null, // Left null explicitly for guest row requirement
        name: standardName,
        email: null
      })
      .select("id")
      .single();

    if (guestErr) redirect(buildRedirectPath(`/campaigns/${campaign_id}/donate`, { error: "Failed to manage guest donor tracking." }));
    finalDonorId = guestDonor.id;
  }

  // --- STEP 2: FETCH CAMPAIGN BALANCE ---
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, current_amount")
    .eq("id", campaign_id)
    .single();

  if (campaignError || !campaign) {
    redirect(buildRedirectPath(`/campaigns/${campaign_id}/donate`, { error: "Campaign not found." }));
  }

  // --- STEP 3: INSERT TRANSACTION LEDGER ---
  const { error: donationError } = await supabase
    .from("donations")
    .insert({
      campaign_id,
      donor_id: finalDonorId, // Always populated with a UUID key pointing to 'donors'
      donor_name: standardName,
      amount,
      message,
    });

  if (donationError) {
    redirect(buildRedirectPath(`/campaigns/${campaign_id}/donate`, { error: donationError.message }));
  }

  // --- STEP 4: UPDATE CAMPAIGN TOTAL ---
  const { error: updateError } = await supabase
    .from("campaigns")
    .update({ current_amount: Number(campaign.current_amount ?? 0) + amount })
    .eq("id", campaign_id);

  if (updateError) {
    redirect(buildRedirectPath(`/campaigns/${campaign_id}/donate`, { error: "Total update failed." }));
  }

  redirect(`/campaigns/${campaign_id}?success=true`);
}