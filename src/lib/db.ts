import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 requires a driver adapter — no DATABASE_URL in schema.prisma.
//
// During `next build` on Vercel the DATABASE_URL env var is present because
// it is set for ALL environments (Build + Runtime) in the Vercel dashboard.
// If it is somehow absent we return a safe lazy proxy so the module can be
// imported without crashing — the proxy throws only when a query is executed.

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // Return a proxy that defers the "no DB" error to query time, not import time.
    // This keeps the build from failing when the env var is missing.
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (prop === "then") return undefined; // not a Promise
        return () => {
          throw new Error(
            `[db] DATABASE_URL is not set. Cannot execute query on "${String(prop)}".`
          );
        };
      },
    });
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter } as never);
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
