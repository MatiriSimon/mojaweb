"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPortal } from "react-dom";

function buildRedirectPath(path: string, params: Record<string, string> = {}) {
  const url = new URL(path, "http://localhost:3000");

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return `${url.pathname}${url.search}`;
}

export async function createCampaign(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const goal_amount = Number(formData.get("goal_amount") ?? 0);
  const cover_image_url = String(formData.get("cover_image_url") ?? "").trim();
  const end_date_str = String(formData.get("end_date") ?? "").trim();

  // Convert string (e.g. "2026-07-15") into a Date object
  const end_date = end_date_str ? new Date(end_date_str) : null;

  if (!title || !description || !goal_amount || goal_amount <= 0) {
    redirect(
      buildRedirectPath("/dashboard/create", {
        error: "Please add a title, description, and a valid goal amount.",
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
        redirectTo: "/dashboard/create",
      })
    );
  }

  const { error } = await supabase
    .from("campaigns")
    .insert({
      creator_id: user.id,
      title,
      description,
      goal_amount,
      current_amount: 0,
      cover_image_url: cover_image_url || null,
      end_date, // <-- new field
    })
    .select("*")
    .single();

  if (error) {
    redirect(
      buildRedirectPath("/dashboard/create", {
        error: error.message ?? "Unable to create the campaign right now.",
      })
    );
  }

  redirect("/dashboard/my-campaigns");
}
