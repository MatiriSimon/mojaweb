import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CampaignsCard from "@/components/campaigns-card";

export default async function MyCampaignsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <main className="min-h-screen bg-gray-50 p-8 text-center">
        <h1 className="text-2xl font-bold">Please sign in</h1>
        <p className="mt-2 text-gray-600">You need an account to manage your fundraiser campaigns.</p>
      </main>
    );
  }

  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black">← Back to dashboard</Link>
        <Link href="/dashboard/create" className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">Create campaign</Link>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-gray-500">My campaigns</p>
            <h1 className="mt-2 text-3xl font-bold">Fundraisers you created</h1>
            <p className="mt-2 text-gray-600">Track progress and share them with your community.</p>
          </div>
        </div>

        {error ? (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error.message}</p>
        ) : null}

        {!campaigns?.length ? (
          <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">You have not created any campaigns yet.</p>
            <Link href="/dashboard/create" className="mt-4 inline-flex rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">Create your first fundraiser</Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignsCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
