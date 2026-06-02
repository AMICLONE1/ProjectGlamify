import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail, writeAudit } from "@/lib/auth";

const updateSchema = z.object({
  status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"]).optional(),
  staffId: z.string().nullable().optional(),
  startsAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const apt = await db.appointment.findFirst({
    where: { id, tenantId: auth.tenantId },
    include: {
      client: true,
      staff: { include: { user: { select: { id: true, fullName: true, avatarUrl: true } } } },
      items: { include: { service: true } },
      invoice: { select: { id: true, status: true, totalAmt: true, invoiceNumber: true } },
    },
  });
  if (!apt) return fail("NOT_FOUND", "Appointment not found", 404);
  return ok(apt);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const existing = await db.appointment.findFirst({ where: { id, tenantId: auth.tenantId } });
  if (!existing) return fail("NOT_FOUND", "Appointment not found", 404);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "VALIDATION_ERROR", issues: parsed.error.issues } }, { status: 422 });
  }

  const { startsAt, ...rest } = parsed.data;
  const apt = await db.appointment.update({
    where: { id },
    data: {
      ...rest,
      ...(startsAt ? { startsAt: new Date(startsAt) } : {}),
    },
  });

  await writeAudit(auth.tenantId, auth.userId, "update", "appointment", id, { status: apt.status });
  return ok(apt);
}
