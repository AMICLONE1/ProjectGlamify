import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail, writeAudit } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  costPrice: z.number().min(0).optional(),
  sellPrice: z.number().min(0).optional(),
  reorderLevel: z.number().optional(),
  supplier: z.string().optional(),
  isActive: z.boolean().optional(),
});

const movementSchema = z.object({
  locationId: z.string(),
  type: z.enum(["purchase", "adjustment", "waste", "sale", "transfer"]),
  qty: z.number(),
  note: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const product = await db.product.findFirst({
    where: { id, tenantId: auth.tenantId },
    include: {
      stockMovements: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!product) return fail("NOT_FOUND", "Product not found", 404);
  return ok({ ...product, isLowStock: product.stockQty <= product.reorderLevel });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const existing = await db.product.findFirst({ where: { id, tenantId: auth.tenantId } });
  if (!existing) return fail("NOT_FOUND", "Product not found", 404);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "VALIDATION_ERROR", issues: parsed.error.issues } }, { status: 422 });
  }

  const product = await db.product.update({ where: { id }, data: parsed.data });
  await writeAudit(auth.tenantId, auth.userId, "update", "product", id);
  return ok(product);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // POST /api/v1/inventory/:id — record a stock movement
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const existing = await db.product.findFirst({ where: { id, tenantId: auth.tenantId } });
  if (!existing) return fail("NOT_FOUND", "Product not found", 404);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = movementSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "VALIDATION_ERROR", issues: parsed.error.issues } }, { status: 422 });
  }

  const { locationId, type, qty, note } = parsed.data;
  const delta = ["purchase", "adjustment"].includes(type) ? qty : -Math.abs(qty);

  const [movement] = await db.$transaction([
    db.stockMovement.create({
      data: { productId: id, locationId, type: type as never, qty, note: note ?? null, createdBy: auth.userId },
    }),
    db.product.update({ where: { id }, data: { stockQty: { increment: delta } } }),
  ]);

  await writeAudit(auth.tenantId, auth.userId, "stock_movement", "product", id, { type, qty });
  return ok(movement, 201);
}
