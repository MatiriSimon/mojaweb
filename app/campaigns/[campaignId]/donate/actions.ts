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
  let message = String(formData.get("message") ?? "").trim();

  // Validate message length (max 50 chars per schema)
  if (message.length > 50) {
    message = message.substring(0, 50);
  }

  if (!campaign_id || !amount || amount <= 0) {
    redirect(buildRedirectPath(`/campaigns/${campaign_id}/donate`, { error: "Please enter a valid donation amount." }));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let finalDonorId: string | null = null;
  const standardName = donor_name || user?.email?.split("@")[0] || "Anonymous Guest";

  // --- STEP 1: RESOLVE OR CREATE DONOR PROFILE ---
  if (user) {
    // If user is logged in, check if they already have a donor record linked to their profile
    const { data: existingDonor } = await supabase
      .from("donors")
      .select("id")
      .eq("profiles_id", user.id)
      .maybeSingle();

    if (existingDonor) {
      finalDonorId = existingDonor.id;
    } else {
      // First-time logged-in donor: create their donor profile linked via profiles_id
      const { data: newDonor, error: donorErr } = await supabase
        .from("donors")
        .insert({
          profiles_id: user.id, // Link to the auth user profile
          full_name: standardName,
          email: user.email
        })
        .select("id")
        .single();

      if (donorErr) redirect(buildRedirectPath(`/campaigns/${campaign_id}/donate`, { error: "Failed to set up your donor profile." }));
      finalDonorId = newDonor.id;
    }
  } else {
    // Guest User: Always create a fresh donor record with profiles_id as null
    const { data: guestDonor, error: guestErr } = await supabase
      .from("donors")
      .insert({
        profiles_id: null, // No linked profile for guests
        full_name: standardName,
        email: null
      })
      .select("id")
      .single();

    if (guestErr) redirect(buildRedirectPath(`/campaigns/${campaign_id}/donate`, { error: "Failed to manage guest donor tracking." }));
    finalDonorId = guestDonor.id;
  }

  // --- STEP 2: FETCH CAMPAIGN BALANCE AND TITLE ---
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, title, current_amount")
    .eq("id", campaign_id)
    .single();

  if (campaignError || !campaign) {
    redirect(buildRedirectPath(`/campaigns/${campaign_id}/donate`, { error: "Campaign not found." }));
  }

  // --- STEP 3: INSERT DONATION RECORD ---
  const { error: donationError } = await supabase
    .from("donations")
    .insert({
      campaign_id,
      donor_id: finalDonorId, // Always populated with a UUID key pointing to 'donors' table
      donor_name: standardName,
      campaign_title: campaign.title,
      amount,
      currency: "KES",
      gateway: "stripe", // Payment gateway (required field)
      payment_status: "pending",
      message: message || null,
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