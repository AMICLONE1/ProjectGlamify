// POST /api/v1/admin/users/reset — send a password-reset email to a user.
// Super-admin only. Safer than impersonation: lets the owner regain access.

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ok, fail } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";

const schema = z.object({ userId: z.string() });

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "userId required", 422);

  const user = await db.user.findUnique({ where: { id: parsed.data.userId }, select: { email: true } });
  if (!user) return fail("NOT_FOUND", "User not found", 404);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.auth.resetPasswordForEmail(user.email.toLowerCase(), {
    redirectTo: `${SITE_URL}/login`,
  });
  if (error) return fail("RESET_FAILED", error.message, 502);

  return ok({ sent: true, email: user.email });
}
