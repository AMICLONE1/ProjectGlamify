/**
 * Wipes ALL application data — every tenant, user, storefront, booking, invoice, etc.
 * Also deletes all Supabase Auth users so the auth side starts clean too.
 *
 * Run:  npx tsx scripts/wipe-db.ts --yes
 */
import { config } from "dotenv";
config({ path: ".env.local", override: false });
config({ path: ".env", override: false });

import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

if (!process.argv.includes("--yes")) {
  console.error("Refusing to run without --yes. This deletes ALL data.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const db = new PrismaClient({ adapter } as never);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  console.log("Truncating all application tables…");
  // One TRUNCATE … CASCADE across every mapped table resets the whole app schema.
  await db.$executeRawUnsafe(`
    TRUNCATE TABLE
      leads,
      audit_logs,
      online_bookings,
      storefront_reviews,
      storefront_photos,
      storefronts,
      loyalty_transactions,
      invoice_line_items,
      invoices,
      appointment_items,
      appointments,
      stock_movements,
      products,
      campaigns,
      clients,
      services,
      service_categories,
      staff_details,
      users,
      locations,
      tenants
    RESTART IDENTITY CASCADE;
  `);
  console.log("✓ Database tables truncated.");

  console.log("Deleting all Supabase Auth users…");
  let page = 1;
  let deleted = 0;
  // listUsers is paginated; loop until empty.
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    if (data.users.length === 0) break;
    for (const u of data.users) {
      await supabase.auth.admin.deleteUser(u.id).catch((e) => console.warn("  skip", u.email, e.message));
      deleted++;
    }
    if (data.users.length < 100) break;
    page++;
  }
  console.log(`✓ Deleted ${deleted} Supabase Auth user(s).`);

  await db.$disconnect();
  console.log("\nDone. Database and auth are clean.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
