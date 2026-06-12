/*
const page = () => {
  return (
    <div className="fontStyle text-5xl text-center mt-20 font-extrabold">
      Welcome To The Future!
    </div>
  )
}

export default page

*/

// Public Landing Page (no auth required)

// Server Component — no auth check needed
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <nav className="border-b bg-white px-8 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="text-xl font-bold tracking-tight">MojaWeb</span>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm text-gray-600 hover:text-black">Log in</a>
            <a href="/signup" className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">Get started</a>
          </div>
        </div>
      </nav>

      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center md:py-32">
        <p className="text-sm uppercase tracking-[0.35em] text-gray-500">Fundraising made simple</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">Raise support for funerals, weddings, community projects, and hospital bills.</h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-600 md:text-xl">Create trusted campaigns, share them with your network, and receive donations through a sleek Supabase-powered platform.</p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="/signup" className="rounded-xl bg-black px-6 py-3 text-base text-white hover:bg-gray-800">Start fundraising</a>
          <a href="/dashboard" className="rounded-xl border border-gray-200 px-6 py-3 text-base text-gray-700 hover:bg-gray-50">Go to dashboard</a>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 md:grid-cols-3 md:px-6 lg:px-8">
        {[
          ["Fast setup", "Launch a campaign in minutes with a simple, friendly form."],
          ["Shareable links", "Send the fundraiser to family, friends, and community members."],
          ["Secure donations", "Track contributions and keep your supporters informed."],
        ].map(([title, copy]) => (
          <article key={title} className="rounded-3xl border bg-gray-50 p-6 text-left shadow-sm">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-gray-600">{copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}