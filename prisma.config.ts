import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first (dev), then fall back to .env
config({ path: ".env.local", override: false });
config({ path: ".env", override: false });

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
