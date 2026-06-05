// GET  /api/v1/manage/services  — list all tenant services (active + inactive)
// POST /api/v1/manage/services  — create a new service

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

const createSchema = z.object({
  name:            z.string().min(1).max(100),
  categoryName:    z.string().min(1).max(60),
  durationMinutes: z.number().int().min(5).max(480),
  price:           z.number().finite().min(0).max(1_000_000),
  priceType:       z.enum(["fixed", "from", "range"]).default("fixed"),
  priceMax:        z.number().finite().min(0).max(1_000_000).nullable().optional(),
  description:     z.string().max(200).optional(),
}).refine((d) => d.priceType !== "range" || (d.priceMax != null && d.priceMax > d.price), {
  message: "For a range, the max price must be greater than the starting price",
  path: ["priceMax"],
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const services = await db.service.findMany({
    where: { tenantId: auth.tenantId },
    include: { category: { select: { id: true, name: true } } },
    orderBy: [{ category: { name: "asc" } }, { createdAt: "asc" }],
  });

  return ok({ services });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid input", 422);

  const { name, categoryName, durationMinutes, price, priceType, priceMax, description } = parsed.data;

  // Upsert category
  let category = await db.serviceCategory.findFirst({
    where: { tenantId: auth.tenantId, name: { equals: categoryName, mode: "insensitive" } },
  });
  if (!category) {
    category = await db.serviceCategory.create({
      data: { tenantId: auth.tenantId, name: categoryName },
    });
  }

  const service = await db.service.create({
    data: {
      tenantId: auth.tenantId,
      categoryId: category.id,
      name,
      durationMinutes,
      price,
      priceType,
      priceMax: priceType === "range" ? priceMax ?? null : null,
      description: description ?? null,
      isActive: true,
    },
    include: { category: true },
  });

  await revalidateStorefront(auth.tenantId);
  return ok({ service }, 201);
}
