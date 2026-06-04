// GET   /api/v1/admin/leads — waitlist / demo / contact submissions.
// PATCH /api/v1/admin/leads — update a lead's status.
// Super-admin only.

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { ok, fail } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;

  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind"); // signup | demo | contact
  const status = searchParams.get("status"); // new | contacted | converted | rejected

  const leads = await db.lead.findMany({
    where: {
      ...(kind ? { kind } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const counts = await db.lead.groupBy({ by: ["status"], _count: true });

  return ok({
    leads,
    counts: counts.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.status]: c._count }), {}),
  });
}

const patchSchema = z.object({
  id: z.string(),
  status: z.enum(["new", "contacted", "demo_scheduled", "demo_done", "converted", "rejected"]),
});

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues.map((i) => i.message).join(", "), 422);

  const updated = await db.lead.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });
  return ok({ lead: updated });
}
