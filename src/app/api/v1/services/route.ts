import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail, writeAudit } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(480),
  price: z.number().min(0),
  taxPct: z.number().min(0).max(100).default(18),
  isActive: z.boolean().default(true),
  photoUrl: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const active = searchParams.get("active");

  const services = await db.service.findMany({
    where: {
      tenantId: auth.tenantId,
      ...(categoryId ? { categoryId } : {}),
      ...(active !== null ? { isActive: active === "true" } : {}),
    },
    include: { category: { select: { id: true, name: true } } },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });

  return ok({ services });
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

  const service = await db.service.create({ data: { tenantId: auth.tenantId, ...parsed.data } });
  await writeAudit(auth.tenantId, auth.userId, "create", "service", service.id);
  return ok(service, 201);
}
