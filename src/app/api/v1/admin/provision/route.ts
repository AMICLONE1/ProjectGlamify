// POST /api/v1/admin/provision — create a new tenant + owner account from the admin panel.
// Gated by requireAdmin (supports bypass cookie). Returns credentials to hand to the client.

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ok, fail } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";

const schema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9+\-\s()]{8,18}$/),
  password: z.string().min(8).max(100),
  businessName: z.string().min(2).max(120),
  businessType: z.enum(["salon", "spa", "clinic", "barbershop", "tattoo", "other"]),
  city: z.string().min(2).max(80),
  plan: z.enum(["trial", "starter", "growth", "professional", "enterprise"]).default("trial"),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", issues: parsed.error.issues } },
      { status: 422 }
    );
  }

  const { fullName, email, phone, password, businessName, businessType, city, plan } = parsed.data;

  const existing = await db.user.findFirst({ where: { email } });
  if (existing) return fail("EMAIL_TAKEN", "An account with this email already exists", 409);

  const supabase = getSupabaseAdmin();
  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { fullName, businessName },
  });
  if (authError || !created.user) {
    return fail("SUPABASE_ERROR", authError?.message ?? "Failed to create auth user", 502);
  }
  const supabaseUid = created.user.id;

  const slug =
    businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) +
    "-" + Date.now().toString(36);

  try {
    const tenant = await db.tenant.create({
      data: {
        name: businessName,
        slug,
        businessType: businessType as never,
        email,
        phone,
        plan,
        locations: { create: { name: "Main Branch", city, isActive: true } },
        users: {
          create: { fullName, email, phone, role: "owner", isActive: true, supabaseUid },
        },
      },
      include: { users: true },
    });

    return ok({
      tenantId: tenant.id,
      userId: tenant.users[0].id,
      email,
      password,
      plan,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/login`,
    }, 201);
  } catch (e) {
    await supabase.auth.admin.deleteUser(supabaseUid).catch(() => {});
    return fail("DB_ERROR", e instanceof Error ? e.message : "Failed to create tenant", 500);
  }
}
