import { config } from "dotenv";
config({ path: ".env.local", override: false });
config({ path: ".env", override: false });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

async function main() {
  console.log("Attempting sign in with owner@glamifydemo.in / Glamify@2026 …");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "owner@glamifydemo.in",
    password: "Glamify@2026",
  });

  if (error) {
    console.error("Sign in FAILED:", error.message, error.status);
    return;
  }

  console.log("Sign in OK — token:", data.session?.access_token?.slice(0, 40) + "…");

  // Now test /api/v1/auth/me
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${data.session!.access_token}` },
  });
  const me = await res.json();
  console.log("auth/me status:", res.status);
  console.log("auth/me body:", JSON.stringify(me, null, 2));
}

main().catch(console.error);
