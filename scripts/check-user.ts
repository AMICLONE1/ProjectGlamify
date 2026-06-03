import { config } from "dotenv";
config({ path: ".env.local", override: false });
config({ path: ".env", override: false });

import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const db = new PrismaClient({ adapter } as never);

async function main() {
  const user = await db.user.findFirst({
    where: { email: "owner@glamifydemo.in" },
    include: { tenant: { include: { locations: { take: 1 } } } },
  });

  if (!user) { console.log("NO USER FOUND"); return; }

  console.log("User:", { id: user.id, email: user.email, role: user.role, isActive: user.isActive, supabaseUid: user.supabaseUid });
  console.log("Tenant:", { id: user.tenant.id, name: user.tenant.name, plan: user.tenant.plan });
  console.log("Locations:", user.tenant.locations.length, user.tenant.locations.map((l: { id: string; name: string }) => l.name));
}

main().catch(console.error).finally(() => db.$disconnect());
