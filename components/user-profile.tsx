// Client Component Example (with real-time / interactive)
// When you need client-side Supabase access (real-time subscriptions, etc.)

"use client";


import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";


export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = useMemo(() => createClient(), []);


  useEffect(() => {
    const { auth } = supabase;

    auth.getUser().then(({ data }) => setUser(data.user));


    const { data: listener } = auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );


    return () => listener.subscription.unsubscribe();
  }, [supabase]);


  if (!user) return null;


  return (
    <div className="text-sm text-gray-600">
      Signed in as <strong>{user.email}</strong>
    </div>
  );
}