import Link from "next/link";

interface DonatePageProps {
  params: { campaignId: string };
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function DonatePage({ params, searchParams }: DonatePageProps) {
  const { campaignId } = await params;
  const { error, success } = await searchParams;
  const message = error ? error : success ? success : null;

  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-white text-gray-900">
      <nav className="border-b bg-white/95 px-6 py-4 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href={`/campaigns/${campaignId}`} className="text-sm text-gray-600 hover:text-black">← Back to campaign</Link>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs uppercase tracking-[0.35em] text-gray-500">Donate</span>
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500">Support the cause</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Make a donation</h1>
          <p className="mt-2 text-gray-600">Enter your amount and phone number to start an M-Pesa STK Push request.</p>

          <form action="/api/mpesa/stk-push" method="post" className="mt-6 space-y-5">
            {message ? <p className="rounded-2xl bg-gray-100 p-3 text-sm text-gray-700">{message}</p> : null}
            <input type="hidden" name="campaignId" value={campaignId} />

            <div className="rounded-2xl bg-gray-50 p-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">Amount (KES)</label>
              <input name="amount" type="number" min="1" required className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-black" placeholder="1000" />
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone number</label>
              <input name="phone" type="tel" inputMode="tel" required className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black" placeholder="254712345678" />
              <p className="mt-2 text-xs text-gray-500">Use the phone number that will receive the M-Pesa prompt.</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">Your name (optional)</label>
              <input name="donorName" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black" placeholder="Jane Doe" />
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">Message (optional)</label>
              <textarea name="message" rows={4} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black" placeholder="Wishing you strength and support."></textarea>
            </div>

            <button type="submit" className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800">
              Pay with M-Pesa
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
