import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signToken, ok, fail } from "@/lib/auth";

const schema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.email(),
  phone: z.string().regex(/^[0-9+\-\s()]{8,18}$/),
  password: z.string().min(8).max(100),
  businessName: z.string().min(2).max(120),
  businessType: z.enum(["salon", "spa", "clinic", "barbershop", "tattoo", "other"]),
  city: z.string().min(2).max(80),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", issues: parsed.error.issues } },
      { status: 422 }
    );
  }

  const { fullName, email, phone, password, businessName, businessType, city } = parsed.data;

  const existing = await db.user.findFirst({ where: { email, tenant: { is: {} } } });
  if (existing) return fail("EMAIL_TAKEN", "An account with this email already exists", 409);

  const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) + "-" + Date.now().toString(36);
  const passwordHash = await bcrypt.hash(password, 12);

  const tenant = await db.tenant.create({
    data: {
      name: businessName,
      slug,
      businessType: businessType as never,
      email,
      phone,
      locations: {
        create: { name: "Main Branch", city, isActive: true },
      },
      users: {
        create: {
          fullName,
          email,
          phone,
          role: "owner",
          isActive: true,
          // Store hashed password in supabaseUid field temporarily until Supabase wired
          supabaseUid: passwordHash,
        },
      },
    },
    include: {
      users: true,
      locations: true,
    },
  });

  const user = tenant.users[0];
  const token = signToken({ sub: user.id, tenantId: tenant.id, role: user.role });

  return ok({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, tenantId: tenant.id } }, 201);
}
