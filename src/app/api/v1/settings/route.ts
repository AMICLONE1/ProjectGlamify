// GET   /api/v1/settings — business profile, tax, and integration settings (real, per-tenant)
// PATCH /api/v1/settings — update any subset

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";

// Shape of the flexible `settings` JSON column.
type TenantSettings = {
  tax?: {
    hsnServices?: string;
    hsnRetail?: string;
    defaultGstPct?: number;
    invoicePrefix?: string;
    showInclusive?: boolean;
  };
  integrations?: Record<string, boolean>;
  revenueGoal?: number; // monthly revenue goal in ₹ (dashboard GoalCard)
};

const patchSchema = z.object({
  // Business profile
  name: z.string().min(2).max(120).optional(),
  legalName: z.string().max(160).optional(),
  phone: z.string().max(20).optional(),
  email: z.email().optional().or(z.literal("")),
  about: z.string().max(600).optional(),
  openHour: z.number().int().min(0).max(23).optional(),
  closeHour: z.number().int().min(1).max(24).optional(),
  gstin: z.string().max(20).optional(),
  revenueGoal: z.number().min(0).max(1_000_000_000).optional(),
  // Tax (stored in settings JSON)
  tax: z.object({
    hsnServices: z.string().max(20).optional(),
    hsnRetail: z.string().max(20).optional(),
    defaultGstPct: z.number().min(0).max(28).optional(),
    invoicePrefix: z.string().max(8).optional(),
    showInclusive: z.boolean().optional(),
  }).optional(),
  // Integrations toggles (stored in settings JSON)
  integrations: z.record(z.string(), z.boolean()).optional(),
}).strict();

function profileComplete(t: { name: string | null; phone: string | null; email: string | null; about: string | null; openHour: number | null; closeHour: number | null }) {
  return !!(t.name?.trim() && t.phone?.trim() && t.email?.trim() && t.about?.trim() && t.openHour != null && t.closeHour != null);
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const tenant = await db.tenant.findUnique({
    where: { id: auth.tenantId },
    select: {
      name: true, legalName: true, phone: true, email: true, about: true,
      openHour: true, closeHour: true, gstin: true, businessType: true, settings: true,
    },
  });
  if (!tenant) return fail("NOT_FOUND", "Tenant not found", 404);

  const settings = (tenant.settings as TenantSettings | null) ?? {};

  return ok({
    profile: {
      name: tenant.name ?? "",
      legalName: tenant.legalName ?? "",
      phone: tenant.phone ?? "",
      email: tenant.email ?? "",
      about: tenant.about ?? "",
      openHour: tenant.openHour,
      closeHour: tenant.closeHour,
      businessType: tenant.businessType,
      revenueGoal: settings.revenueGoal ?? null,
    },
    tax: {
      gstin: tenant.gstin ?? "",
      hsnServices: settings.tax?.hsnServices ?? "",
      hsnRetail: settings.tax?.hsnRetail ?? "",
      defaultGstPct: settings.tax?.defaultGstPct ?? null,
      invoicePrefix: settings.tax?.invoicePrefix ?? "",
      showInclusive: settings.tax?.showInclusive ?? false,
    },
    integrations: settings.integrations ?? {},
    profileComplete: profileComplete(tenant),
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid settings input", 422);
  const d = parsed.data;

  const existing = await db.tenant.findUnique({ where: { id: auth.tenantId }, select: { settings: true } });
  const currentSettings = (existing?.settings as TenantSettings | null) ?? {};

  // Merge JSON-stored sections
  const nextSettings: TenantSettings = { ...currentSettings };
  if (d.tax) nextSettings.tax = { ...currentSettings.tax, ...d.tax };
  if (d.integrations) nextSettings.integrations = { ...currentSettings.integrations, ...d.integrations };
  if (d.revenueGoal !== undefined) nextSettings.revenueGoal = d.revenueGoal;

  const updated = await db.tenant.update({
    where: { id: auth.tenantId },
    data: {
      ...(d.name      !== undefined ? { name: d.name }           : {}),
      ...(d.legalName !== undefined ? { legalName: d.legalName } : {}),
      ...(d.phone     !== undefined ? { phone: d.phone }         : {}),
      ...(d.email     !== undefined ? { email: d.email || null } : {}),
      ...(d.about     !== undefined ? { about: d.about }         : {}),
      ...(d.openHour  !== undefined ? { openHour: d.openHour }   : {}),
      ...(d.closeHour !== undefined ? { closeHour: d.closeHour } : {}),
      ...(d.gstin     !== undefined ? { gstin: d.gstin }         : {}),
      ...(d.tax || d.integrations || d.revenueGoal !== undefined ? { settings: nextSettings as never } : {}),
    },
    select: {
      name: true, phone: true, email: true, about: true, openHour: true, closeHour: true,
    },
  });

  // Keep shared fields in sync with the Storefront editor:
  //   Tenant.about → Storefront.description   |   Tenant.phone → Location.phone
  if (d.about !== undefined) {
    await db.storefront.updateMany({
      where: { tenantId: auth.tenantId },
      data: { description: d.about },
    });
  }
  if (d.phone !== undefined) {
    const loc = await db.location.findFirst({ where: { tenantId: auth.tenantId }, select: { id: true } });
    if (loc) await db.location.update({ where: { id: loc.id }, data: { phone: d.phone } });
  }

  // Revalidate the public storefront so the change shows immediately.
  if (d.about !== undefined || d.phone !== undefined) {
    const { revalidateStorefront } = await import("@/lib/revalidate-storefront");
    await revalidateStorefront(auth.tenantId);
  }

  return ok({ saved: true, profileComplete: profileComplete({ ...updated, legalName: null } as never) });
}
