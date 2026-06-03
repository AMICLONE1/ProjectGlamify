// GET /api/v1/inventory/movements?limit=50&productId=
// Returns stock movement history for the tenant, optionally filtered by product.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, ok } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);

  const movements = await db.stockMovement.findMany({
    where: {
      product: { tenantId: auth.tenantId },
      ...(productId ? { productId } : {}),
    },
    include: {
      product: { select: { id: true, name: true, unit: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return ok({ movements });
}
