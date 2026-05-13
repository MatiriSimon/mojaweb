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
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b">
        <span className="text-xl font-bold">One</span>
        <div className="flex gap-4">
          <a href="/login" className="text-sm text-gray-600 hover:text-black">
            Log in
          </a>
          <a
            href="/signup"
            className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Get started
          </a>
        </div>
      </nav>


      <section className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Welcome to One
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mb-10">
          A powerful platform built for convenience.
        </p>
        <a
          href="/signup"
          className="bg-black text-white px-8 py-3 rounded-xl text-lg hover:bg-gray-800 transition"
        >
          Start for free
        </a>
      </section>
    </main>
  );
}