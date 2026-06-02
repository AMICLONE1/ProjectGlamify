import { config } from "dotenv";
config({ path: ".env.local" });

const SUPABASE_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE    = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET          = process.env.SUPABASE_STORAGE_BUCKET ?? "glamify-photos";

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error("❌ Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first");
    process.exit(1);
  }

  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${SERVICE_ROLE}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id:               BUCKET,
      name:             BUCKET,
      public:           true,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      fileSizeLimit:    5242880,
    }),
  });

  const data = await res.json().catch(() => null);

  if (res.ok) {
    console.log(`✅ Created Supabase Storage bucket: ${BUCKET}`);
  } else if (data?.error === "Bucket already exists" || data?.statusCode === "409") {
    console.log(`ℹ️  Bucket already exists: ${BUCKET}`);
  } else {
    console.error("❌ Failed to create bucket:", data);
    process.exit(1);
  }

  console.log("\n✅ Supabase setup complete!");
  console.log("   Run: npx next dev to start the app");
}

main();
