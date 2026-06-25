// Public Landing Page (no auth required)
import CampaignsCard from "@/components/campaigns-card";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, description, goal_amount, current_amount, cover_image_url, end_date")
    .order("current_amount", { ascending: false })
    .limit(3);

  const popularCampaigns = campaigns ?? [];

  return (
    <main className="min-h-screen bg-background bg-slate-stripes text-foreground">
      <nav className="border-b border-gray-800 bg-background px-8 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="text-xl font-bold tracking-tight">MojaWeb</span>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm border border-brand-secondary text-white hover:opacity-90  rounded-lg px-4 py-1.5">
              Log in
            </a>
            <a
              href="/signup"
              className="rounded-lg bg-brand-secondary px-4 py-2 text-sm text-white hover:opacity-90"
            >
              Get started
            </a>
          </div>
        </div>
      </nav>

    

      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center md:py-32">
        <p className="text-sm uppercase tracking-[0.35em] text-gray-400">
          Fundraising made simple
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-[#14ffe0] [text-shadow:0_0_20px_rgba(57,255,20,0.6)] md:text-6xl">
          Raise support for various causes.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-400 md:text-xl">
          Create trusted campaigns, share them with your network, and receive
          donations through a sleek Supabase-powered platform.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/signup"
            className="rounded-xl bg-brand-secondary px-6 py-3 text-base text-white hover:opacity-90"
          >
            Start campaign
          </a>
          <a
            href="/dashboard"
            className="rounded-xl bg-brand-secondary border border-gray-800 px-6 py-3 text-base text-gray-300 hover:opacity-90"
          >
            Go to dashboard
          </a>
        </div>

      
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Popular campaigns</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Support causes that are already gaining momentum</h2>
          </div>
          <a href="/dashboard" className="text-sm text-gray-300 hover:text-white">
            Create your own fundraiser →
          </a>
        </div>

        {popularCampaigns.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {popularCampaigns.map((campaign) => (
              <CampaignsCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-800 bg-gray-900/50 p-6 text-sm text-gray-400">
            No campaigns have been shared yet. Create one from the dashboard to feature it here.
          </div>
        )}
      </section>

      <section className="mx-auto bg-background-primary grid max-w-7xl gap-6 px-4 pb-16 md:grid-cols-3 md:px-6 lg:px-8">
        {[
          [
            "Fast setup",
            "Launch a campaign in minutes with a simple, friendly form.",
          ],
          [
            "Shareable links",
            "Send the fundraiser to family, friends, and community members.",
          ],
          [
            "Secure donations",
            "Track contributions and keep your supporters informed.",
          ],
        ].map(([title, copy]) => (
          <article
            key={title}
            className="rounded-3xl border border-gray-800 bg-gray-900/50 p-6 text-left shadow-sm"
          >
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm text-gray-400">{copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
