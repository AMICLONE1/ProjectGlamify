import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail, writeAudit } from "@/lib/auth";

const createSchema = z.object({
  locationId: z.string(),
  clientId: z.string(),
  staffId: z.string().optional(),
  startsAt: z.string().datetime(),
  serviceIds: z.array(z.string()).min(1),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");
  const staffId = searchParams.get("staffId");
  const clientId = searchParams.get("clientId");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(200, Number(searchParams.get("limit") ?? 50));

  const appointments = await db.appointment.findMany({
    where: {
      tenantId: auth.tenantId,
      ...(locationId ? { locationId } : {}),
      ...(staffId ? { staffId } : {}),
      ...(clientId ? { clientId } : {}),
      ...(status ? { status: status as never } : {}),
      ...(from || to ? {
        startsAt: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to ? { lte: new Date(to) } : {}),
        },
      } : {}),
    },
    include: {
      client: { select: { id: true, fullName: true, phone: true } },
      staff: { include: { user: { select: { id: true, fullName: true, avatarUrl: true } } } },
      items: { include: { service: { select: { id: true, name: true, durationMinutes: true } } } },
    },
    orderBy: { startsAt: "asc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return ok({ appointments });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "VALIDATION_ERROR", issues: parsed.error.issues } }, { status: 422 });
  }

  const { locationId, clientId, staffId, startsAt, serviceIds, notes } = parsed.data;

  // Verify all services belong to this tenant
  const services = await db.service.findMany({
    where: { id: { in: serviceIds }, tenantId: auth.tenantId, isActive: true },
  });
  if (services.length !== serviceIds.length) return fail("INVALID_SERVICES", "One or more services not found", 422);

  const totalDuration = services.reduce((s: number, sv: { durationMinutes: number }) => s + sv.durationMinutes, 0);
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + totalDuration * 60_000);

  const appointment = await db.appointment.create({
    data: {
      tenantId: auth.tenantId,
      locationId,
      clientId,
      staffId: staffId ?? null,
      startsAt: start,
      endsAt: end,
      notes: notes ?? null,
      status: "confirmed",
      items: {
        create: services.map((sv: { id: string; price: number; durationMinutes: number }) => ({
          serviceId: sv.id,
          price: sv.price,
          durationMinutes: sv.durationMinutes,
        })),
      },
    },
    include: {
      client: { select: { id: true, fullName: true, phone: true } },
      items: { include: { service: { select: { id: true, name: true } } } },
    },
  });

  await writeAudit(auth.tenantId, auth.userId, "create", "appointment", appointment.id);
  return ok(appointment, 201);
}
