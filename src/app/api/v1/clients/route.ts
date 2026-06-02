import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail, writeAudit } from "@/lib/auth";

const createSchema = z.object({
  fullName: z.string().min(1).max(120),
  phone: z.string().optional(),
  email: z.email().optional().or(z.literal("")),
  dob: z.string().optional(),
  gender: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  preferredStaffId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const tag = searchParams.get("tag");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));
  const skip = (page - 1) * limit;

  const where = {
    tenantId: auth.tenantId,
    ...(q ? {
      OR: [
        { fullName: { contains: q, mode: "insensitive" as const } },
        { phone: { contains: q } },
        { email: { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
  };

  const [clients, total] = await Promise.all([
    db.client.findMany({
      where,
      orderBy: { lastVisitAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true, fullName: true, phone: true, email: true, tags: true,
        loyaltyPoints: true, totalVisits: true, totalSpend: true, lastVisitAt: true,
        preferredStaffId: true, createdAt: true,
      },
    }),
    db.client.count({ where }),
  ]);

  return ok({ clients, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
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

  const { dob, email, ...rest } = parsed.data;

  const client = await db.client.create({
    data: {
      tenantId: auth.tenantId,
      ...rest,
      email: email || null,
      dob: dob ? new Date(dob) : null,
      allergies: rest.allergies ?? [],
      tags: rest.tags ?? [],
    },
  });

  await writeAudit(auth.tenantId, auth.userId, "create", "client", client.id);
  return ok(client, 201);
}
