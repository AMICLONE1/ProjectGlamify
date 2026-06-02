import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail, writeAudit } from "@/lib/auth";

const markPaidSchema = z.object({
  paymentMethod: z.enum(["cash", "upi", "card", "wallet", "gift_card", "complimentary"]),
  razorpayPaymentId: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const invoice = await db.invoice.findFirst({
    where: { id, tenantId: auth.tenantId },
    include: {
      client: true,
      lineItems: { include: { service: { select: { id: true, name: true } } } },
      appointment: { select: { id: true, startsAt: true } },
    },
  });
  if (!invoice) return fail("NOT_FOUND", "Invoice not found", 404);
  return ok(invoice);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // POST /api/v1/invoices/:id/pay via nested route — handled in /[id]/pay/route.ts
  // This is a convenience alias
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const invoice = await db.invoice.findFirst({ where: { id, tenantId: auth.tenantId } });
  if (!invoice) return fail("NOT_FOUND", "Invoice not found", 404);
  if (invoice.status === "paid") return fail("ALREADY_PAID", "Invoice already paid", 409);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = markPaidSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "VALIDATION_ERROR", issues: parsed.error.issues } }, { status: 422 });
  }

  const updated = await db.invoice.update({
    where: { id },
    data: {
      status: "paid",
      paymentMethod: parsed.data.paymentMethod as never,
      razorpayPaymentId: parsed.data.razorpayPaymentId ?? null,
      paidAt: new Date(),
    },
  });

  const loyaltyPoints = Math.round(invoice.totalAmt / 10);
  await db.$transaction([
    db.client.update({
      where: { id: invoice.clientId },
      data: {
        totalVisits: { increment: 1 },
        totalSpend: { increment: invoice.totalAmt },
        loyaltyPoints: { increment: loyaltyPoints },
        lastVisitAt: new Date(),
      },
    }),
    db.loyaltyTransaction.create({
      data: {
        clientId: invoice.clientId,
        invoiceId: id,
        type: "earn",
        points: loyaltyPoints,
        note: `Earned on invoice ${invoice.invoiceNumber}`,
      },
    }),
  ]);

  await writeAudit(auth.tenantId, auth.userId, "pay", "invoice", id);
  return ok(updated);
}
