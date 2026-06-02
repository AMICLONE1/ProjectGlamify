import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail, writeAudit } from "@/lib/auth";

const updateSchema = z.object({
  fullName: z.string().min(1).max(120).optional(),
  phone: z.string().optional(),
  role: z.enum(["owner", "manager", "staff", "receptionist"]).optional(),
  isActive: z.boolean().optional(),
  speciality: z.string().optional(),
  bio: z.string().optional(),
  commissionPct: z.number().min(0).max(100).optional(),
  isBookable: z.boolean().optional(),
  locationId: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const user = await db.user.findFirst({
    where: { id, tenantId: auth.tenantId },
    include: {
      staffDetail: { include: { location: true } },
    },
  });
  if (!user) return fail("NOT_FOUND", "Staff member not found", 404);
  return ok(user);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  if (auth.role !== "owner" && auth.role !== "manager") return fail("FORBIDDEN", "Insufficient permissions", 403);

  const { id } = await params;
  const existing = await db.user.findFirst({ where: { id, tenantId: auth.tenantId } });
  if (!existing) return fail("NOT_FOUND", "Staff member not found", 404);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "VALIDATION_ERROR", issues: parsed.error.issues } }, { status: 422 });
  }

  const { speciality, bio, commissionPct, isBookable, locationId, ...userFields } = parsed.data;

  await db.$transaction([
    db.user.update({ where: { id }, data: userFields as never }),
    ...(speciality !== undefined || bio !== undefined || commissionPct !== undefined || isBookable !== undefined || locationId !== undefined
      ? [db.staffDetail.update({
          where: { userId: id },
          data: {
            ...(speciality !== undefined ? { speciality } : {}),
            ...(bio !== undefined ? { bio } : {}),
            ...(commissionPct !== undefined ? { commissionPct } : {}),
            ...(isBookable !== undefined ? { isBookable } : {}),
            ...(locationId !== undefined ? { locationId } : {}),
          },
        })]
      : []),
  ]);

  await writeAudit(auth.tenantId, auth.userId, "update", "staff", id);
  const updated = await db.user.findUnique({ where: { id }, include: { staffDetail: true } });
  return ok(updated);
}
