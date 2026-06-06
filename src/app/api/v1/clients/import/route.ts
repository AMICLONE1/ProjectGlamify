// POST /api/v1/clients/import — bulk import clients from a parsed spreadsheet.
// Body: { rows: [{ fullName, phone?, email?, gender?, notes?, tags?[] }, ...] }
// Dedupes by phone within the tenant: existing → updated, new → created.

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail, writeAudit } from "@/lib/auth";

const rowSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().max(160).optional().or(z.literal("")),
  gender: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
});

const bodySchema = z.object({
  rows: z.array(rowSchema).min(1).max(5000),
});

// Normalise a phone to digits-only for reliable matching (handles +91, spaces, etc.)
function normPhone(p?: string | null): string {
  return (p ?? "").replace(/\D/g, "");
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid import data. Each row needs at least a name.", 422);
  }

  const rows = parsed.data.rows;

  // Pre-load existing clients (by phone) for this tenant to decide create vs update.
  const existing = await db.client.findMany({
    where: { tenantId: auth.tenantId },
    select: { id: true, phone: true },
  });
  const byPhone = new Map<string, string>(); // normalisedPhone -> clientId
  for (const c of existing) {
    const np = normPhone(c.phone);
    if (np) byPhone.set(np, c.id);
  }

  let created = 0, updated = 0, skipped = 0;
  const errors: string[] = [];
  // Track phones seen within THIS file so duplicate rows in the sheet don't double-insert.
  const seenInFile = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const fullName = r.fullName.trim();
    if (!fullName) { skipped++; continue; }

    const np = normPhone(r.phone);
    const email = (r.email ?? "").trim() || null;
    const gender = (r.gender ?? "").trim() || null;
    const notes = (r.notes ?? "").trim() || null;
    const tags = (r.tags ?? []).filter(Boolean);

    try {
      if (np && byPhone.has(np)) {
        // Update existing client (only fill non-empty values).
        await db.client.update({
          where: { id: byPhone.get(np)! },
          data: {
            fullName,
            ...(email ? { email } : {}),
            ...(gender ? { gender } : {}),
            ...(notes ? { notes } : {}),
            ...(tags.length ? { tags } : {}),
          },
        });
        updated++;
      } else if (np && seenInFile.has(np)) {
        // Same phone appeared twice in the upload — skip the dup.
        skipped++;
      } else {
        const c = await db.client.create({
          data: {
            tenantId: auth.tenantId,
            fullName,
            phone: np ? r.phone!.trim() : null,
            email,
            gender,
            notes,
            tags,
            allergies: [],
          },
        });
        if (np) { byPhone.set(np, c.id); seenInFile.add(np); }
        created++;
      }
      if (np) seenInFile.add(np);
    } catch (e) {
      skipped++;
      if (errors.length < 10) errors.push(`Row ${i + 2}: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  await writeAudit(auth.tenantId, auth.userId, "import", "client", `${created}+${updated}`);

  return ok({ created, updated, skipped, total: rows.length, errors });
}
