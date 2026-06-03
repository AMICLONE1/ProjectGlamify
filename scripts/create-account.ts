/**
 * Creates one Glamify-issued business account: a Supabase Auth user + Tenant +
 * owner User (linked via supabaseUid) + default Location.
 *
 * Run:  npx tsx scripts/create-account.ts
 *   Optional env overrides:
 *     ACC_EMAIL, ACC_PASSWORD, ACC_NAME, ACC_BUSINESS, ACC_TYPE, ACC_CITY, ACC_PHONE
 */
import { config } from "dotenv";
config({ path: ".env.local", override: false });
config({ path: ".env", override: false });

import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

const acc = {
  email:    process.env.ACC_EMAIL    ?? "owner@glamifydemo.in",
  password: process.env.ACC_PASSWORD ?? "Glamify@2026",
  fullName: process.env.ACC_NAME     ?? "Omkar Kolhe",
  business: process.env.ACC_BUSINESS ?? "Studio Glamify",
  type:     process.env.ACC_TYPE     ?? "salon",
  city:     process.env.ACC_CITY     ?? "Pune",
  phone:    process.env.ACC_PHONE    ?? "9876543210",
};

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const db = new PrismaClient({ adapter } as never);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const existing = await db.user.findFirst({ where: { email: acc.email } });
  if (existing) {
    console.error(`A user with email ${acc.email} already exists. Wipe first or use a different ACC_EMAIL.`);
    process.exit(1);
  }

  console.log("Creating Supabase Auth user…");
  const { data: created, error } = await supabase.auth.admin.createUser({
    email: acc.email,
    password: acc.password,
    email_confirm: true,
    user_metadata: { fullName: acc.fullName, businessName: acc.business },
  });
  if (error || !created.user) throw error ?? new Error("Failed to create auth user");
  const supabaseUid = created.user.id;

  const slug =
    acc.business.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) +
    "-" + Date.now().toString(36);

  console.log("Creating tenant + owner + location…");
  const tenant = await db.tenant.create({
    data: {
      name: acc.business,
      slug,
      businessType: acc.type as never,
      email: acc.email,
      phone: acc.phone,
      locations: { create: { name: "Main Branch", city: acc.city, isActive: true } },
      users: {
        create: {
          fullName: acc.fullName,
          email: acc.email,
          phone: acc.phone,
          role: "owner",
          isActive: true,
          supabaseUid,
        },
      },
    },
    include: { users: true, locations: true },
  });

  await db.$disconnect();

  console.log("\n✓ Account created.\n");
  console.log("  ─────────────────────────────────────");
  console.log("   Login at:  /login");
  console.log(`   Email:     ${acc.email}`);
  console.log(`   Password:  ${acc.password}`);
  console.log("  ─────────────────────────────────────");
  console.log(`   Tenant:    ${tenant.name} (${tenant.id})`);
  console.log(`   Location:  ${tenant.locations[0].name} · ${acc.city}`);
  console.log(`   SupabaseUID linked: ${supabaseUid}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
