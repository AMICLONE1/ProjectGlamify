// DELETE /api/v1/manage/photos/[id]  — remove a photo (DB record + Supabase Storage file)
// PATCH  /api/v1/manage/photos/[id]  — update alt text

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";
import { deletePhoto } from "@/lib/storage";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

// Derive the Supabase storage path from a public URL.
// URL format: {supabaseUrl}/storage/v1/object/public/{bucket}/{storagePath}
function storagePathFromUrl(url: string): string | null {
  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "glamify-photos";
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.slice(idx + marker.length);
  } catch {
    return null;
  }
}

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;

  const sf = await db.storefront.findUnique({ where: { tenantId: auth.tenantId }, select: { id: true } });
  if (!sf) return fail("NOT_FOUND", "Storefront not found", 404);

  const photo = await db.storefrontPhoto.findFirst({ where: { id, storefrontId: sf.id } });
  if (!photo) return fail("NOT_FOUND", "Photo not found", 404);

  await db.storefrontPhoto.delete({ where: { id } });

  // Delete the file from Supabase Storage (best-effort — don't fail the request if this errors)
  const storagePath = storagePathFromUrl(photo.url);
  if (storagePath) {
    await deletePhoto(storagePath).catch(() => {});
  }

  // Re-sequence sortOrder after deletion
  const remaining = await db.storefrontPhoto.findMany({
    where: { storefrontId: sf.id },
    orderBy: { sortOrder: "asc" },
  });
  await Promise.all(remaining.map((p, i) =>
    db.storefrontPhoto.update({ where: { id: p.id }, data: { sortOrder: i } })
  ));

  await revalidateStorefront(auth.tenantId);
  return ok({ deleted: true, id });
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;
  const schema = z.object({ altText: z.string().max(200).optional() });

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid input", 422);

  const sf = await db.storefront.findUnique({ where: { tenantId: auth.tenantId }, select: { id: true } });
  if (!sf) return fail("NOT_FOUND", "Storefront not found", 404);

  const updated = await db.storefrontPhoto.updateMany({
    where: { id, storefrontId: sf.id },
    data: { altText: parsed.data.altText ?? null },
  });

  if (updated.count === 0) return fail("NOT_FOUND", "Photo not found", 404);

  return ok({ updated: true });
}
