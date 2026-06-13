import CampaignsForm from "@/components/campaigns-form";

interface CreateCampaignPageProps {
  searchParams: { error?: string };
}

export default function CreateCampaignPage({ searchParams }: CreateCampaignPageProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-4">
        <a href="/dashboard" className="text-sm text-gray-600 hover:text-black">← Back to dashboard</a>
      </nav>

      <section className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-gray-500">Create fundraiser</p>
          <h1 className="mt-2 text-3xl font-bold">Start a new campaign</h1>
          <p className="mt-2 text-gray-600">Use this form to launch a fundraiser for a community project, wedding, funeral, or hospital support.</p>
        </div>

        <CampaignsForm error={searchParams.error} />
      </section>
    </main>
  );
}
