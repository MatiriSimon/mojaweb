import { signUp } from "@/app/auth/actions";


export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
        <h1 className="text-2xl font-bold mb-6">Create account</h1>


        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )}


        <form action={signUp} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>


          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>


          <button
            type="submit"
            className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition mt-2"
          >
            Create account
          </button>
        </form>


        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-black font-medium hover:underline">
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}