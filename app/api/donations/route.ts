import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");

  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("donations")
    .select("*, campaigns(title)")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "You must be signed in to donate." }, { status: 401 });
  }

  const payload = await request.json();
  const campaignId = String(payload.campaign_id ?? "").trim();
  const amount = Number(payload.amount ?? 0);

  if (!campaignId || !amount || amount <= 0) {
    return NextResponse.json({ error: "A valid campaign and amount are required." }, { status: 400 });
  }

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, current_amount, goal_amount")
    .eq("id", campaignId)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("donations")
    .insert({
      campaign_id: campaignId,
      donor_id: user.id,
      donor_name: String(payload.donor_name ?? user.email ?? "Anonymous").trim() || "Anonymous",
      amount,
      message: String(payload.message ?? "").trim(),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("campaigns")
    .update({ current_amount: Number(campaign.current_amount ?? 0) + amount })
    .eq("id", campaignId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ donation: data, campaignId }, { status: 201 });
}
