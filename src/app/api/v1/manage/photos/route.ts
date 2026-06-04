// GET  /api/v1/manage/photos  — list storefront photos ordered by sortOrder
// POST /api/v1/manage/photos  — add a photo (base64 dataUrl or external URL)
// PATCH /api/v1/manage/photos — reorder (body: { order: [id1, id2, ...] })

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";
import { uploadPhoto } from "@/lib/storage";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

const addSchema = z.object({
  url:     z.string().url().or(z.string().startsWith("data:")),
  altText: z.string().max(200).optional(),
});

const reorderSchema = z.object({
  order: z.array(z.string()).min(1),
});

async function getStorefrontId(tenantId: string): Promise<string | null> {
  const sf = await db.storefront.findUnique({ where: { tenantId }, select: { id: true } });
  return sf?.id ?? null;
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const sfId = await getStorefrontId(auth.tenantId);
  if (!sfId) return fail("NOT_FOUND", "Storefront not found", 404);

  const photos = await db.storefrontPhoto.findMany({
    where: { storefrontId: sfId },
    orderBy: { sortOrder: "asc" },
  });

  return ok({ photos });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "url is required", 422);

  const sfId = await getStorefrontId(auth.tenantId);
  if (!sfId) return fail("NOT_FOUND", "Storefront not found", 404);

  const count = await db.storefrontPhoto.count({ where: { storefrontId: sfId } });
  if (count >= 20) return fail("LIMIT_EXCEEDED", "Maximum 20 photos per storefront", 422);

  // If it's a base64 dataUrl, validate MIME type then upload to Supabase Storage
  let finalUrl = parsed.data.url;
  if (parsed.data.url.startsWith("data:")) {
    const mimeMatch = parsed.data.url.match(/^data:([^;]+);/);
    const mime = mimeMatch?.[1] ?? "";
    const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!ALLOWED_MIME.includes(mime)) {
      return fail("UNSUPPORTED_FORMAT", `File type "${mime}" is not supported. Upload JPG, PNG, WEBP, or GIF. iPhone HEIC photos must be converted first.`, 422);
    }
    const result = await uploadPhoto(parsed.data.url, auth.tenantId, "storefront");
    finalUrl = result.url;
  }

  const photo = await db.storefrontPhoto.create({
    data: {
      storefrontId: sfId,
      url: finalUrl,
      altText: parsed.data.altText ?? null,
      sortOrder: count,
    },
  });

  await revalidateStorefront(auth.tenantId);
  return ok({ photo }, 201);
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "order array required", 422);

  const sfId = await getStorefrontId(auth.tenantId);
  if (!sfId) return fail("NOT_FOUND", "Storefront not found", 404);

  // Update sortOrder for each ID in the given order
  await Promise.all(
    parsed.data.order.map((id, idx) =>
      db.storefrontPhoto.updateMany({
        where: { id, storefrontId: sfId },
        data: { sortOrder: idx },
      })
    )
  );

  await revalidateStorefront(auth.tenantId);
  return ok({ reordered: true });
}
