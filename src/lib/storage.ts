// Photo storage abstraction.
// When NEXT_PUBLIC_SUPABASE_URL is set, uploads to Supabase Storage.
// Otherwise returns the base64 dataUrl as-is (dev fallback).

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "glamify-photos";

export type UploadResult = {
  url: string;       // public CDN URL
  path: string;      // storage path (for deletion)
};

// ─── Supabase Storage ─────────────────────────────────────────────────────────

async function uploadToSupabase(dataUrl: string, tenantId: string, fileName: string): Promise<UploadResult> {
  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase credentials not configured");

  // Convert base64 dataUrl → binary
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/data:([^;]+);/);
  const mimeType  = mimeMatch?.[1] ?? "image/jpeg";
  const ext       = mimeType.split("/")[1] ?? "jpg";
  const buffer    = Buffer.from(base64, "base64");

  const path = `${tenantId}/${Date.now()}-${fileName}.${ext}`;

  const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${serviceRoleKey}`,
      "Content-Type": mimeType,
      "x-upsert":     "true",
    },
    body: buffer,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => "");
    throw new Error(`Supabase storage upload failed: ${uploadRes.status} ${text}`);
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
  return { url: publicUrl, path };
}

async function deleteFromSupabase(path: string): Promise<void> {
  const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return;

  await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${serviceRoleKey}` },
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function uploadPhoto(dataUrl: string, tenantId: string, fileName = "photo"): Promise<UploadResult> {
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (hasSupabase && dataUrl.startsWith("data:")) {
    try {
      return await uploadToSupabase(dataUrl, tenantId, fileName);
    } catch (err) {
      console.error("[Storage] Supabase upload failed, using base64 fallback:", err);
    }
  }

  // Dev fallback: store base64 inline (fine for dev, not for prod)
  console.log("[Storage] Using base64 inline fallback (set Supabase credentials for CDN)");
  return { url: dataUrl, path: `local:${tenantId}:${fileName}` };
}

export async function deletePhoto(path: string): Promise<void> {
  if (path.startsWith("local:") || path.startsWith("data:")) return; // dev fallback
  await deleteFromSupabase(path).catch(err =>
    console.error("[Storage] Delete failed:", err)
  );
}
