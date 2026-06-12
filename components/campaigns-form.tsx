"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CampaignsForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);

    const payload = {
      title: String(form.get("title") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
      category: String(form.get("category") ?? "General").trim(),
      goal_amount: Number(form.get("goal_amount") ?? 0),
      image_url: String(form.get("image_url") ?? "").trim(),
    };

    if (!payload.title || !payload.description || !payload.goal_amount || payload.goal_amount <= 0) {
      setError("Please add a title, description, and a valid goal amount.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error ?? "Unable to create the campaign right now.");
      setLoading(false);
      return;
    }

    router.push("/dashboard/my-campaigns");
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}

      <div>
        <label className="mb-1 block text-sm font-medium">Campaign title</label>
        <input name="title" required className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="Funeral support for Mama Akin" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <input name="category" className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="Funeral, Wedding, Hospital, Community" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Goal amount (KES)</label>
        <input name="goal_amount" type="number" min="1" required className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="50000" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Image URL</label>
        <input name="image_url" type="url" className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="https://example.com/image.jpg" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Story / description</label>
        <textarea name="description" rows={5} required className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="Tell donors why this fundraiser matters and how the funds will be used." />
      </div>

      <button type="submit" disabled={loading} className="w-full rounded-xl bg-black px-4 py-2.5 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400">
        {loading ? "Creating campaign..." : "Create campaign"}
      </button>
    </form>
  );
}
