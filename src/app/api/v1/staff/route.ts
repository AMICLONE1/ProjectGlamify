import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAuth, ok, fail, writeAudit } from "@/lib/auth";

const createSchema = z.object({
  fullName: z.string().min(1).max(120),
  email: z.email(),
  phone: z.string().optional(),
  role: z.enum(["owner", "manager", "staff", "receptionist"]).default("staff"),
  password: z.string().min(8).default("Glamify@123"),
  locationId: z.string(),
  speciality: z.string().optional(),
  bio: z.string().optional(),
  commissionPct: z.number().min(0).max(100).default(0),
  isBookable: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");

  const staff = await db.user.findMany({
    where: {
      tenantId: auth.tenantId,
      isActive: true,
      staffDetail: { is: {} },
      ...(locationId ? { staffDetail: { locationId } } : {}),
    },
    include: {
      staffDetail: {
        include: { location: { select: { id: true, name: true } } },
      },
    },
    orderBy: { fullName: "asc" },
  });

  return ok({ staff });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  if (auth.role !== "owner" && auth.role !== "manager") return fail("FORBIDDEN", "Insufficient permissions", 403);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "VALIDATION_ERROR", issues: parsed.error.issues } }, { status: 422 });
  }

  const { fullName, email, phone, role, password, locationId, speciality, bio, commissionPct, isBookable } = parsed.data;

  const existing = await db.user.findFirst({ where: { email, tenantId: auth.tenantId } });
  if (existing) return fail("EMAIL_TAKEN", "A user with this email already exists", 409);

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      tenantId: auth.tenantId,
      fullName,
      email,
      phone: phone ?? null,
      role: role as never,
      supabaseUid: passwordHash,
      staffDetail: {
        create: { locationId, speciality: speciality ?? null, bio: bio ?? null, commissionPct, isBookable },
      },
    },
    include: { staffDetail: true },
  });

  await writeAudit(auth.tenantId, auth.userId, "create", "staff", user.id);
  return ok({ id: user.id, fullName: user.fullName, email: user.email, role: user.role, staffDetail: user.staffDetail }, 201);
}
