import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail, writeAudit } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  categoryId: z.string().nullable().optional(),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  price: z.number().finite().min(0).max(1_000_000).optional(),
  taxPct: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  photoUrl: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const service = await db.service.findFirst({
    where: { id, tenantId: auth.tenantId },
    include: { category: true },
  });
  if (!service) return fail("NOT_FOUND", "Service not found", 404);
  return ok(service);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const existing = await db.service.findFirst({ where: { id, tenantId: auth.tenantId } });
  if (!existing) return fail("NOT_FOUND", "Service not found", 404);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "VALIDATION_ERROR", issues: parsed.error.issues } }, { status: 422 });
  }

  const service = await db.service.update({ where: { id }, data: parsed.data });
  await writeAudit(auth.tenantId, auth.userId, "update", "service", id);
  return ok(service);
}
