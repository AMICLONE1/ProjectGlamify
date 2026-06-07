import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local — the single source of local secrets. (On Vercel, env vars
// are injected directly, so dotenv is effectively a no-op there.)
config({ path: ".env.local", override: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use direct connection (port 5432) for schema operations — pgbouncer (port 6543) blocks DDL
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"]!,
  },
});
