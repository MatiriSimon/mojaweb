import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProgressBar from "@/components/proggress-bar";

export default async function CampaignDetailPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const supabase = await createClient();

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (error || !campaign) {
    return (
      <main className="min-h-screen bg-gray-50 p-8 text-center">
        <h1 className="text-2xl font-bold">Campaign not found</h1>
        <p className="mt-2 text-gray-600">This fundraiser may have been removed or the link is invalid.</p>
      </main>
    );
  }

  const raised = Number(campaign.current_amount ?? 0);
  const goal = Number(campaign.goal_amount ?? 1);

  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-white text-gray-900">
      <nav className="border-b bg-white/95 px-6 py-4 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black">← Back to dashboard</Link>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs uppercase tracking-[0.35em] text-gray-500">Fundraiser</span>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          {campaign.image_url ? (
            <img src={campaign.image_url} alt={campaign.title} className="h-64 w-full rounded-3xl object-cover" />
          ) : (
            <div className="flex h-64 w-full items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">No image provided</div>
          )}

          <p className="mt-5 text-[11px] uppercase tracking-[0.35em] text-gray-500">{campaign.category ?? "General"}</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{campaign.title}</h1>
          <p className="mt-4 text-gray-700">{campaign.description}</p>
        </article>

        <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Current progress</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">KES {raised.toLocaleString()}</h2>
          <p className="text-sm text-gray-500">Goal: KES {goal.toLocaleString()}</p>

          <div className="mt-5 rounded-2xl bg-gray-50 p-4">
            <ProgressBar current={raised} goal={goal} />
          </div>

          <div className="mt-6 rounded-2xl bg-black p-5 text-white">
            <p className="text-sm text-gray-200">Support this campaign</p>
            <p className="mt-1 text-sm text-gray-100">Every contribution helps bring this project or event to life.</p>
          </div>

          <Link
            href={`/campaigns/${campaign.id}/donate`}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Donate now
          </Link>

          <p className="mt-4 text-xs text-gray-500">This fundraiser is powered by Supabase and can be shared with family, friends, and community donors.</p>
        </aside>
      </section>
    </main>
  );
}
