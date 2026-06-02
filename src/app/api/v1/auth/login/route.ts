import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signToken, ok, fail } from "@/lib/auth";

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "email and password required", 422);

  const { email, password } = parsed.data;

  const user = await db.user.findFirst({
    where: { email, isActive: true },
    include: { tenant: { select: { id: true, name: true, plan: true } } },
  });

  if (!user || !user.supabaseUid) return fail("INVALID_CREDENTIALS", "Invalid email or password", 401);

  const valid = await bcrypt.compare(password, user.supabaseUid);
  if (!valid) return fail("INVALID_CREDENTIALS", "Invalid email or password", 401);

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const token = signToken({ sub: user.id, tenantId: user.tenantId, role: user.role });

  return ok({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenant: user.tenant,
    },
  });
}
