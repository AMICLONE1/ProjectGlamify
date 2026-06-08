import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail, writeAudit } from "@/lib/auth";

// Sane upper bound for a single line price (₹10 lakh). Guards against corrupt /
// overflowed values that would otherwise crash the DB write or produce garbage totals.
const MAX_UNIT_PRICE = 1_000_000;

const lineItemSchema = z.object({
  serviceId: z.string().optional(),
  label: z.string().min(1),
  qty: z.number().int().min(1).max(999).default(1),
  unitPrice: z.number().finite().min(0).max(MAX_UNIT_PRICE),
  discountPct: z.number().min(0).max(100).default(0),
  taxPct: z.number().min(0).max(100).default(18),
});

const createSchema = z.object({
  locationId: z.string(),
  clientId: z.string(),
  appointmentId: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1),
  discountAmt: z.number().min(0).default(0),
  tipAmt: z.number().min(0).default(0),
  paymentMethod: z.enum(["cash", "upi", "card", "wallet", "gift_card", "complimentary"]).default("cash"),
  notes: z.string().optional(),
  markPaid: z.boolean().default(false),
});

function calcTotals(lineItems: z.infer<typeof lineItemSchema>[], discountAmt: number, tipAmt: number) {
  let subtotal = 0;
  let taxTotal = 0;
  const items = lineItems.map((li) => {
    const base = li.qty * li.unitPrice * (1 - li.discountPct / 100);
    const tax = base * (li.taxPct / 100);
    subtotal += base;
    taxTotal += tax;
    const lineTotal = parseFloat((base + tax).toFixed(2));
    // Defensive: a non-finite lineTotal would crash the Prisma Float write.
    if (!Number.isFinite(lineTotal)) throw new Error("Invalid line item amount");
    return { ...li, lineTotal };
  });
  const taxableAmt = parseFloat((subtotal - discountAmt).toFixed(2));
  const cgstAmt = parseFloat((taxTotal / 2).toFixed(2));
  const sgstAmt = parseFloat((taxTotal / 2).toFixed(2));
  const totalAmt = parseFloat((taxableAmt + taxTotal + tipAmt).toFixed(2));
  return { items, subtotal: parseFloat(subtotal.toFixed(2)), taxableAmt, cgstAmt, sgstAmt, totalAmt };
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));

  const invoices = await db.invoice.findMany({
    where: {
      tenantId: auth.tenantId,
      ...(clientId ? { clientId } : {}),
      ...(status ? { status: status as never } : {}),
      ...(from || to ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}),
    },
    include: {
      client: { select: { id: true, fullName: true, phone: true } },
      lineItems: true,
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit + 1, // fetch one extra to detect if there's a next page
  });

  const hasMore = invoices.length > limit;
  return ok({ invoices: hasMore ? invoices.slice(0, limit) : invoices, hasMore });
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

  const { locationId, clientId, appointmentId, lineItems, discountAmt, tipAmt, paymentMethod, notes, markPaid } = parsed.data;

  let totals;
  try {
    totals = calcTotals(lineItems, discountAmt, tipAmt);
  } catch {
    return fail("INVALID_AMOUNT", "One or more line item amounts are invalid. Please re-check the prices.", 422);
  }
  const { items, subtotal, taxableAmt, cgstAmt, sgstAmt, totalAmt } = totals;

  // Generate invoice number: GLM-YYYYMM-NNNN
  const count = await db.invoice.count({ where: { tenantId: auth.tenantId } });
  const now = new Date();
  const invoiceNumber = `GLM-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${String(count + 1).padStart(4, "0")}`;

  const invoice = await db.invoice.create({
    data: {
      tenantId: auth.tenantId,
      locationId,
      clientId,
      appointmentId: appointmentId ?? null,
      invoiceNumber,
      status: markPaid ? "paid" : "issued",
      subtotal,
      discountAmt,
      taxableAmt,
      cgstAmt,
      sgstAmt,
      totalAmt,
      tipAmt,
      paymentMethod: paymentMethod as never,
      paidAt: markPaid ? new Date() : null,
      notes: notes ?? null,
      lineItems: { create: items },
    },
    include: { lineItems: true, client: { select: { id: true, fullName: true } } },
  });

  if (markPaid) {
    const loyaltyPoints = Math.round(totalAmt / 10);
    await db.$transaction([
      db.client.update({
        where: { id: clientId },
        data: {
          totalVisits: { increment: 1 },
          totalSpend: { increment: totalAmt },
          loyaltyPoints: { increment: loyaltyPoints },
          lastVisitAt: new Date(),
        },
      }),
      db.loyaltyTransaction.create({
        data: {
          clientId,
          invoiceId: invoice.id,
          type: "earn",
          points: loyaltyPoints,
          note: `Earned on invoice ${invoiceNumber}`,
        },
      }),
    ]);
  }

  await writeAudit(auth.tenantId, auth.userId, "create", "invoice", invoice.id);
  return ok(invoice, 201);
}
