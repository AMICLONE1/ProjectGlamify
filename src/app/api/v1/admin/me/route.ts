// GET /api/v1/admin/me — confirms the caller is a platform admin (for the UI guard).

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { ok } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;
  return ok({ email: admin.email });
}
