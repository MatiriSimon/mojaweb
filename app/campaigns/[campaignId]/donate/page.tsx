"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function DonatePage() {
  const params = useParams<{ campaignId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaign_id: params.campaignId,
        amount: Number(form.get("amount") ?? 0),
        donor_name: String(form.get("donor_name") ?? "").trim(),
        message: String(form.get("message") ?? "").trim(),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(data.error ?? "Donation could not be recorded.");
      setLoading(false);
      return;
    }

    setMessage("Thank you for your donation!");
    router.push(`/campaigns/${params.campaignId}`);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-white text-gray-900">
      <nav className="border-b bg-white/95 px-6 py-4 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href={`/campaigns/${params.campaignId}`} className="text-sm text-gray-600 hover:text-black">← Back to campaign</Link>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs uppercase tracking-[0.35em] text-gray-500">Donate</span>
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500">Support the cause</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Make a donation</h1>
          <p className="mt-2 text-gray-600">Your contribution will be recorded securely and added to the campaign total.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {message ? <p className="rounded-2xl bg-gray-100 p-3 text-sm text-gray-700">{message}</p> : null}

            <div className="rounded-2xl bg-gray-50 p-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">Amount (KES)</label>
              <input name="amount" type="number" min="1" required className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-black" placeholder="1000" />
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">Your name (optional)</label>
              <input name="donor_name" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black" placeholder="Jane Doe" />
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">Message (optional)</label>
              <textarea name="message" rows={4} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black" placeholder="Wishing you strength and support." />
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:bg-gray-400">
              {loading ? "Processing donation..." : "Donate now"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
