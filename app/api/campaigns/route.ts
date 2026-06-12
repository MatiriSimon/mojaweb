import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
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
    return NextResponse.json({ error: "You must be signed in to create a campaign." }, { status: 401 });
  }

  const payload = await request.json();

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      user_id: user.id,
      title: String(payload.title ?? "").trim(),
      description: String(payload.description ?? "").trim(),
      category: String(payload.category ?? "General").trim(),
      goal_amount: Number(payload.goal_amount ?? 0),
      current_amount: 0,
      image_url: String(payload.image_url ?? "").trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
