// Protected Page (Server Component)

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";


export default async function DashboardPage() {
  const supabase = await createClient();


  // Server-side auth check (middleware already guards this, this is a safety net)
  const {
    data: { user },
  } = await supabase.auth.getUser();


  if (!user) redirect("/login");


  // Example: fetch data from Supabase (BAAS - no custom backend needed)
  const { data: items } = await supabase
    .from("items") // replace with your table name
    .select("*")
    .eq("user_id", user.id);


  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b">
        <span className="font-bold">Dashboard</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-red-500 hover:text-red-700"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>


      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Hello 👋</h1>


        <pre className="bg-white border rounded-xl p-4 text-sm overflow-auto">
          {JSON.stringify(items ?? [], null, 2)}
        </pre>
      </div>
    </main>
  );
}