import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 requires a driver adapter — the URL is no longer in schema.prisma.
// PrismaPg connects to Postgres using the DATABASE_URL env var at runtime.

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Return a client without adapter in build/edge environments where DB isn't needed
    return new PrismaClient();
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter } as never);
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
