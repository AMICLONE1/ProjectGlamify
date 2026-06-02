// GET  /api/v1/onboarding/services  — list tenant's services
// POST /api/v1/onboarding/services  — bulk upsert services from onboarding wizard

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";

const serviceSchema = z.object({
  id: z.string().optional(), // cuid if existing, omit for new
  name: z.string().min(1).max(100),
  categoryName: z.string().min(1).max(60),
  durationMinutes: z.number().int().min(5).max(480),
  price: z.number().min(0),
  description: z.string().max(200).optional(),
});

const bulkSchema = z.object({
  services: z.array(serviceSchema).min(1).max(50),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const services = await db.service.findMany({
    where: { tenantId: auth.tenantId, isActive: true },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });

  return ok({ services });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid services data", 422);

  const { services } = parsed.data;

  // Upsert categories first
  const categoryNames = [...new Set(services.map((s) => s.categoryName))];
  const categories: Record<string, string> = {};

  for (const catName of categoryNames) {
    const existing = await db.serviceCategory.findFirst({
      where: { tenantId: auth.tenantId, name: { equals: catName, mode: "insensitive" } },
    });
    if (existing) {
      categories[catName] = existing.id;
    } else {
      const created = await db.serviceCategory.create({
        data: { tenantId: auth.tenantId, name: catName },
      });
      categories[catName] = created.id;
    }
  }

  // Upsert services
  const results = [];
  for (const svc of services) {
    const categoryId = categories[svc.categoryName];
    if (svc.id) {
      // Update existing
      const updated = await db.service.update({
        where: { id: svc.id },
        data: {
          name: svc.name,
          categoryId,
          durationMinutes: svc.durationMinutes,
          price: svc.price,
          description: svc.description ?? null,
        },
      });
      results.push(updated);
    } else {
      // Create new
      const created = await db.service.create({
        data: {
          tenantId: auth.tenantId,
          categoryId,
          name: svc.name,
          durationMinutes: svc.durationMinutes,
          price: svc.price,
          description: svc.description ?? null,
          isActive: true,
        },
      });
      results.push(created);
    }
  }

  return ok({ services: results });
}
