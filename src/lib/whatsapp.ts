// WhatsApp notification abstraction.
// Provider is selected via WHATSAPP_PROVIDER env var:
//   "meta"    → Meta Cloud API (WhatsApp Business)
//   "console" → prints message to server console (dev/test fallback)
//
// Auto-falls back to console if Meta credentials are missing.

const PROVIDER = process.env.WHATSAPP_PROVIDER ?? "console";

// ─── Message types ────────────────────────────────────────────────────────────

export type WaBookingConfirmed = {
  type: "booking_confirmed";
  phone: string;        // 10-digit Indian mobile
  customerName: string;
  salonName: string;
  dateTime: string;     // "Saturday, 7 Jun · 10:30 AM"
  services: string;     // "Haircut + Blowdry, Hair Spa"
  bookingId: string;
  amount: string;       // "₹1,299"
};

export type WaBookingReminder = {
  type: "booking_reminder";
  phone: string;
  customerName: string;
  salonName: string;
  dateTime: string;
  salonPhone: string;
};

export type WaCheckinCode = {
  type: "checkin_code";
  phone: string;
  customerName: string;
  salonName: string;
  code: string;
};

export type WaReviewRequest = {
  type: "review_request";
  phone: string;
  customerName: string;
  salonName: string;
  reviewLink: string;
};

export type WaMessage = WaBookingConfirmed | WaBookingReminder | WaCheckinCode | WaReviewRequest;

// ─── Console fallback ────────────────────────────────────────────────────────

function logToConsole(msg: WaMessage): void {
  const border = "─".repeat(60);
  console.log(`\n${border}`);
  console.log(`  💬 WhatsApp [${msg.type}] → +91${msg.phone}`);

  switch (msg.type) {
    case "booking_confirmed":
      console.log(`  Hi ${msg.customerName}! ✅ Booking confirmed at ${msg.salonName}`);
      console.log(`  📅 ${msg.dateTime} | 💈 ${msg.services}`);
      console.log(`  💰 ${msg.amount} | 🆔 ${msg.bookingId}`);
      console.log(`  Check-in code will be sent on the morning of your appointment.`);
      break;
    case "booking_reminder":
      console.log(`  Hi ${msg.customerName}! ⏰ Reminder: appointment at ${msg.salonName}`);
      console.log(`  📅 ${msg.dateTime} | 📞 ${msg.salonPhone}`);
      break;
    case "checkin_code":
      console.log(`  Hi ${msg.customerName}! Your check-in code for ${msg.salonName}: ${msg.code}`);
      console.log(`  Show this to the salon staff when you arrive.`);
      break;
    case "review_request":
      console.log(`  Hi ${msg.customerName}! How was your visit at ${msg.salonName}?`);
      console.log(`  Leave a review: ${msg.reviewLink}`);
      break;
  }

  console.log(`  (console fallback — set WHATSAPP_PROVIDER=meta for real messages)`);
  console.log(`${border}\n`);
}

// ─── Meta Cloud API ───────────────────────────────────────────────────────────
// Template names must match approved templates in Meta Business Manager.
// All templates use Indian English, approved for utility category.

async function sendViaMeta(msg: WaMessage): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) throw new Error("WhatsApp Meta credentials not set");

  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
  const to   = `91${msg.phone}`;

  let payload: Record<string, unknown>;

  switch (msg.type) {
    case "booking_confirmed":
      payload = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "booking_confirmed",          // must be approved in Meta BM
          language: { code: "en" },
          components: [{
            type: "body",
            parameters: [
              { type: "text", text: msg.customerName },
              { type: "text", text: msg.salonName },
              { type: "text", text: msg.dateTime },
              { type: "text", text: msg.services },
              { type: "text", text: msg.amount },
              { type: "text", text: msg.bookingId },
            ],
          }],
        },
      };
      break;

    case "booking_reminder":
      payload = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "booking_reminder",
          language: { code: "en" },
          components: [{
            type: "body",
            parameters: [
              { type: "text", text: msg.customerName },
              { type: "text", text: msg.salonName },
              { type: "text", text: msg.dateTime },
              { type: "text", text: msg.salonPhone },
            ],
          }],
        },
      };
      break;

    case "checkin_code":
      payload = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "checkin_code",
          language: { code: "en" },
          components: [{
            type: "body",
            parameters: [
              { type: "text", text: msg.customerName },
              { type: "text", text: msg.salonName },
              { type: "text", text: msg.code },
            ],
          }],
        },
      };
      break;

    case "review_request":
      payload = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "review_request",
          language: { code: "en" },
          components: [{
            type: "body",
            parameters: [
              { type: "text", text: msg.customerName },
              { type: "text", text: msg.salonName },
              { type: "text", text: msg.reviewLink },
            ],
          }],
        },
      };
      break;

    default:
      throw new Error("Unknown WhatsApp message type");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WhatsApp Meta API error ${res.status}: ${text}`);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function sendWhatsApp(msg: WaMessage): Promise<void> {
  const useReal = PROVIDER === "meta" && !!process.env.WHATSAPP_ACCESS_TOKEN;

  if (useReal) {
    try {
      await sendViaMeta(msg);
      return;
    } catch (err) {
      console.error("[WhatsApp] Meta API failed, falling back to console:", err);
    }
  }

  logToConsole(msg);
}

// Helper: format DateTime for WhatsApp messages
export function formatWaDateTime(scheduledAt: Date): string {
  return scheduledAt.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}
