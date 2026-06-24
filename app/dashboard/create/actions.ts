"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createCampaign(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const goal_amount = Number(formData.get("goal_amount") ?? 0);
  const cover_image_url = String(formData.get("cover_image_url") ?? "").trim();

  if (!title || !description || !goal_amount || goal_amount <= 0) {
    const url = new URL("/dashboard/create", process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000");
    url.searchParams.set("error", "Please add a title, description, and a valid goal amount.");
    redirect(url.toString());
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const url = new URL("/login", process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000");
    url.searchParams.set("redirectTo", "/dashboard/create");
    redirect(url.toString());
  }

  const { error } = await supabase
    .from("campaigns")
    .insert({
      user_id: user.id,
      title,
      description,
      goal_amount: goal_amount,
      current_amount: 0,
      cover_image_url: cover_image_url || null,
    })
    .select("*")
    .single();

  if (error) {
    const url = new URL("/dashboard/create", process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000");
    url.searchParams.set("error", error.message ?? "Unable to create the campaign right now.");
    redirect(url.toString());
  }

  redirect("/dashboard/my-campaigns");
}
