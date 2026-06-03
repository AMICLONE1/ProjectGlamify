// GET  /api/v1/campaigns — list campaigns for the tenant
// POST /api/v1/campaigns — create and (optionally) launch a campaign

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  channel: z.enum(["push", "sms", "email", "whatsapp"]),
  segmentId: z.string(),
  segmentLabel: z.string(),
  body: z.string().min(1).max(2000),
  scheduleMode: z.enum(["now", "later"]),
  scheduleAt: z.string().optional(),
  recipientIds: z.array(z.string()),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const campaigns = await db.campaign.findMany({
    where: { tenantId: auth.tenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return ok({ campaigns });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", parsed.error.issues.map((i) => i.message).join(", "), 422);
  }

  const { name, channel, segmentId, segmentLabel, body: msgBody, scheduleMode, scheduleAt, recipientIds } = parsed.data;

  const sendNow = scheduleMode === "now";
  const scheduledAt = !sendNow && scheduleAt ? new Date(scheduleAt) : null;

  // Fetch recipient phone numbers
  const recipients = await db.client.findMany({
    where: { tenantId: auth.tenantId, id: { in: recipientIds }, phone: { not: null } },
    select: { id: true, fullName: true, phone: true },
  });

  const campaign = await db.campaign.create({
    data: {
      tenantId: auth.tenantId,
      name,
      channel: channel as never,
      status: sendNow ? "sending" : "scheduled",
      segment: { id: segmentId, label: segmentLabel } as never,
      body: msgBody,
      scheduledAt,
      recipientCount: recipients.length,
    },
  });

  if (sendNow && recipients.length > 0) {
    let sent = 0;
    const isWhatsAppReal = process.env.WHATSAPP_PROVIDER === "meta" && !!process.env.WHATSAPP_ACCESS_TOKEN;

    for (const r of recipients) {
      if (!r.phone) continue;
      const personalised = msgBody.replace(/\[name\]/gi, r.fullName.split(" ")[0]);
      try {
        if (channel === "whatsapp" && isWhatsAppReal) {
          const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
          await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: `91${r.phone}`,
              type: "text",
              text: { body: personalised },
            }),
          });
        } else {
          // Console fallback for all channels (SMS, email, push, WhatsApp dev)
          console.log(`[CAMPAIGN:${channel.toUpperCase()}] → ${r.phone ?? r.fullName}: ${personalised}`);
        }
        sent++;
      } catch (e) {
        console.error(`[CAMPAIGN] Failed to send to ${r.phone}:`, e);
      }
    }

    await db.campaign.update({
      where: { id: campaign.id },
      data: { status: "sent", sentAt: new Date(), openCount: sent },
    });

    return ok({ campaign: { ...campaign, status: "sent", sentAt: new Date(), openCount: sent } }, 201);
  }

  return ok({ campaign }, 201);
}
