// Client Component Example (with real-time / interactive)
// When you need client-side Supabase access (real-time subscriptions, etc.)

"use client";


import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";


export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();


  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));


    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );


    return () => listener.subscription.unsubscribe();
  }, []);


  if (!user) return null;


  return (
    <div className="text-sm text-gray-600">
      Signed in as <strong>{user.email}</strong>
    </div>
  );
}