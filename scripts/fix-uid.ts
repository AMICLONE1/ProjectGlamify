import { config } from "dotenv";
config({ path: ".env.local", override: false });
config({ path: ".env", override: false });

import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

const EMAIL = process.env.ACC_EMAIL ?? "owner@glamifydemo.in";
const PASSWORD = process.env.ACC_PASSWORD ?? "Glamify@2026";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const db = new PrismaClient({ adapter } as never);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  // 1. Find Supabase Auth user
  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw listErr;

  let authUser = listData.users.find(u => u.email === EMAIL);

  if (!authUser) {
    console.log("No Supabase Auth user found — creating one…");
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error || !created.user) throw error ?? new Error("Failed to create auth user");
    authUser = created.user;
    console.log("Created Supabase Auth user:", authUser.id);
  } else {
    console.log("Supabase Auth UID:", authUser.id);
  }

  // 2. Find DB user
  const dbUser = await db.user.findFirst({ where: { email: EMAIL } });
  if (!dbUser) {
    console.error("No DB user found for", EMAIL, "— run create-account.ts first");
    process.exit(1);
  }

  console.log("DB supabaseUid:   ", dbUser.supabaseUid);
  console.log("Match:", authUser.id === dbUser.supabaseUid);

  if (authUser.id !== dbUser.supabaseUid) {
    console.log("Mismatch — updating DB supabaseUid to match Auth…");
    await db.user.update({
      where: { id: dbUser.id },
      data: { supabaseUid: authUser.id },
    });
    console.log("✓ Fixed. supabaseUid updated to:", authUser.id);
  } else {
    console.log("UIDs already match — checking password…");
    // Reset the password in case it's wrong
    const { error } = await supabase.auth.admin.updateUserById(authUser.id, { password: PASSWORD });
    if (error) console.error("Password reset failed:", error.message);
    else console.log("✓ Password confirmed/reset to:", PASSWORD);
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
