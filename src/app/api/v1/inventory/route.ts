import { NextRequest } from "next/server";
import { z } from "zod";
import type { Product } from "@/generated/prisma";
import { db } from "@/lib/db";
import { requireAuth, ok, fail, writeAudit } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  sku: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().default("pc"),
  costPrice: z.number().min(0).default(0),
  sellPrice: z.number().min(0).default(0),
  stockQty: z.number().default(0),
  reorderLevel: z.number().default(0),
  supplier: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category");
  const lowStock = searchParams.get("lowStock") === "true";

  const products = await db.product.findMany({
    where: {
      tenantId: auth.tenantId,
      isActive: true,
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
      ...(category ? { category } : {}),
      ...(lowStock ? { stockQty: { lte: 0 } } : {}),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  // Flag low-stock items
  const withFlag = products.map((p: Product) => ({ ...p, isLowStock: p.stockQty <= p.reorderLevel }));
  return ok({ products: withFlag });
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

  const product = await db.product.create({ data: { tenantId: auth.tenantId, ...parsed.data } });
  await writeAudit(auth.tenantId, auth.userId, "create", "product", product.id);
  return ok(product, 201);
}
