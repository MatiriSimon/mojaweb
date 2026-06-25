import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import CampaignsCard from "@/components/campaigns-card";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const welcomeName = profiles?.full_name ?? user.email ?? "there";

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gray-500">MojaWeb</p>
            <span className="text-xl font-semibold">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 md:block">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50">Sign out</button>
            </form>
          </div>
        </div>
      </nav>

      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6 lg:px-8">
        <div className="rounded-3xl bg-black p-8 text-white shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-gray-300">Welcome back</p>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">Hello {welcomeName} 👋</h1>
          <p className="mt-3 max-w-2xl text-gray-200">Create and manage fundraising campaigns for funerals, weddings, community projects, hospital bills, and other social events.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/dashboard/create" className="rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-gray-500">Start a fundraiser</p>
            <h2 className="mt-2 text-xl font-semibold">Create a new campaign</h2>
            <p className="mt-2 text-sm text-gray-600">Launch a donation page for your next community or family event.</p>
          </Link>

          <Link href="/dashboard/my-campaigns" className="rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-gray-500">My campaigns</p>
            <h2 className="mt-2 text-xl font-semibold">Manage your pages</h2>
            <p className="mt-2 text-sm text-gray-600">Review the campaigns you created and keep them updated.</p>
          </Link>

          <Link href="/" className="rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-gray-500">Share the app</p>
            <h2 className="mt-2 text-xl font-semibold">Visit the public landing page</h2>
            <p className="mt-2 text-sm text-gray-600">Use the home page to introduce the platform to supporters and donors.</p>
          </Link>
        </div>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-gray-500">Recent</p>
              <h2 className="mt-2 text-2xl font-semibold">Your latest campaigns</h2>
            </div>
            <Link href="/dashboard/my-campaigns" className="text-sm text-black hover:underline">View all</Link>
          </div>

          {!campaigns?.length ? (
            <div className="rounded-2xl bg-gray-50 p-6 text-sm text-gray-600">You have not created a fundraiser yet. Start one from the card above.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {campaigns.map((campaign) => (
                <CampaignsCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}