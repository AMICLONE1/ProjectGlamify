import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail, writeAudit } from "@/lib/auth";

const updateSchema = z.object({
  fullName: z.string().min(1).max(120).optional(),
  phone: z.string().optional(),
  email: z.email().optional().or(z.literal("")),
  dob: z.string().optional(),
  gender: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  preferredStaffId: z.string().nullable().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const client = await db.client.findFirst({
    where: { id, tenantId: auth.tenantId },
    include: {
      appointments: {
        orderBy: { startsAt: "desc" },
        take: 10,
        include: { items: { include: { service: { select: { name: true } } } } },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true, invoiceNumber: true, status: true, totalAmt: true,
          paymentMethod: true, createdAt: true,
        },
      },
      loyaltyTxns: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!client) return fail("NOT_FOUND", "Client not found", 404);
  return ok(client);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const existing = await db.client.findFirst({ where: { id, tenantId: auth.tenantId } });
  if (!existing) return fail("NOT_FOUND", "Client not found", 404);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "VALIDATION_ERROR", issues: parsed.error.issues } }, { status: 422 });
  }

  const { dob, email, ...rest } = parsed.data;
  const client = await db.client.update({
    where: { id },
    data: {
      ...rest,
      ...(email !== undefined ? { email: email || null } : {}),
      ...(dob !== undefined ? { dob: dob ? new Date(dob) : null } : {}),
    },
  });

  await writeAudit(auth.tenantId, auth.userId, "update", "client", id, { before: existing, after: client });
  return ok(client);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  if (auth.role !== "owner" && auth.role !== "manager") return fail("FORBIDDEN", "Insufficient permissions", 403);

  const { id } = await params;
  const existing = await db.client.findFirst({ where: { id, tenantId: auth.tenantId } });
  if (!existing) return fail("NOT_FOUND", "Client not found", 404);

  await db.client.delete({ where: { id } });
  await writeAudit(auth.tenantId, auth.userId, "delete", "client", id);
  return ok({ deleted: true });
}
