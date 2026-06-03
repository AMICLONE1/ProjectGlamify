import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
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

  // Create a Supabase Auth user so the staff member can log in.
  const supabase = getSupabaseAdmin();
  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { fullName },
  });
  if (authError || !created.user) {
    return fail("SUPABASE_ERROR", authError?.message ?? "Failed to create auth user", 502);
  }

  try {
    const user = await db.user.create({
      data: {
        tenantId: auth.tenantId,
        fullName,
        email,
        phone: phone ?? null,
        role: role as never,
        supabaseUid: created.user.id,
        staffDetail: {
          create: { locationId, speciality: speciality ?? null, bio: bio ?? null, commissionPct, isBookable },
        },
      },
      include: { staffDetail: true },
    });

    await writeAudit(auth.tenantId, auth.userId, "create", "staff", user.id);
    return ok({ id: user.id, fullName: user.fullName, email: user.email, role: user.role, staffDetail: user.staffDetail }, 201);
  } catch (e) {
    await supabase.auth.admin.deleteUser(created.user.id).catch(() => {});
    return fail("DB_ERROR", e instanceof Error ? e.message : "Failed to create staff", 500);
  }
}
