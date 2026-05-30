import { clients, type Client } from "./business-seed";

export type Channel = "push" | "whatsapp" | "sms" | "email";

export const channelLabel: Record<Channel, string> = {
  push: "Push",
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
};

export const channelTone: Record<Channel, string> = {
  push: "border-cyan-300/40 bg-cyan-300/10 text-cyan-100",
  whatsapp: "border-emerald-300/40 bg-emerald-300/10 text-emerald-100",
  sms: "border-amber-300/40 bg-amber-300/10 text-amber-100",
  email: "border-violet-300/40 bg-violet-300/10 text-violet-100",
};

export type SegmentId =
  | "vip"
  | "at-risk"
  | "birthday"
  | "new"
  | "high-spend"
  | "all";

export type Segment = {
  id: SegmentId;
  label: string;
  description: string;
  match: Client[];
};

function findClients(predicate: (c: Client) => boolean): Client[] {
  return clients.filter(predicate);
}

export const segments: Segment[] = [
  {
    id: "vip",
    label: "VIP regulars",
    description: "Top tier · loyalty 2000+, visited in last 30 days.",
    match: findClients((c) => c.segment === "VIP"),
  },
  {
    id: "at-risk",
    label: "At-risk clients",
    description: "Haven't visited in 45+ days. Win-back time.",
    match: findClients((c) => c.segment === "At-risk"),
  },
  {
    id: "birthday",
    label: "Birthday this month",
    description: "Birthday in the next 30 days.",
    match: findClients((c) => c.tags.includes("birthday")),
  },
  {
    id: "new",
    label: "New clients",
    description: "First visit in the last 30 days.",
    match: findClients((c) => c.segment === "New"),
  },
  {
    id: "high-spend",
    label: "High lifetime spend",
    description: "₹20,000+ in lifetime spend.",
    match: findClients((c) => c.totalSpend >= 20000),
  },
  {
    id: "all",
    label: "All clients",
    description: "Everyone in the database.",
    match: clients,
  },
];

export type CampaignTemplate = {
  id: string;
  name: string;
  description: string;
  body: string;
};

export const templates: CampaignTemplate[] = [
  {
    id: "t-rebook",
    name: "Rebook reminder",
    description: "Gentle nudge with a fast-rebook link.",
    body:
      "Hi {{client_name}}, it's been a minute! Ready for your next visit with {{preferred_stylist}}? Tap to rebook in 30 seconds.",
  },
  {
    id: "t-birthday",
    name: "Birthday treat",
    description: "Complimentary upgrade for birthday clients.",
    body:
      "🎉 Happy birthday {{client_name}}! Drop in this month and enjoy a complimentary upgrade with {{preferred_stylist}}. On the house.",
  },
  {
    id: "t-tuesday",
    name: "Tuesday fill",
    description: "Off-peak special tuned for slow weekdays.",
    body:
      "Hey {{client_name}}, our calmest slots are Tuesday 8–11 AM. Get 15% off any service in that window — only this Tuesday.",
  },
  {
    id: "t-winback",
    name: "Win-back offer",
    description: "Time-limited offer for lapsed clients.",
    body:
      "We miss you, {{client_name}}. Here's ₹400 off your next visit, valid for the next 14 days. Your seat is waiting.",
  },
];

export type CampaignHistoryEntry = {
  id: string;
  name: string;
  channel: Channel;
  segmentLabel: string;
  audience: number;
  opened: number;
  rebooked: number;
  revenue: number;
  sentAt: string;
};

export const campaignHistory: CampaignHistoryEntry[] = [
  { id: "CMP-2026-118", name: "Tuesday bundle · May 21", channel: "push", segmentLabel: "All clients", audience: 1018, opened: 392, rebooked: 84, revenue: 96400, sentAt: "May 21, 8:00 AM" },
  { id: "CMP-2026-117", name: "May birthday upgrades", channel: "whatsapp", segmentLabel: "Birthday this month", audience: 42, opened: 31, rebooked: 18, revenue: 38700, sentAt: "May 15, 10:30 AM" },
  { id: "CMP-2026-116", name: "VIP packages preview", channel: "email", segmentLabel: "VIP regulars", audience: 94, opened: 71, rebooked: 27, revenue: 124800, sentAt: "May 9, 6:00 PM" },
  { id: "CMP-2026-115", name: "Win-back · ₹400 off", channel: "sms", segmentLabel: "At-risk clients", audience: 27, opened: 18, rebooked: 6, revenue: 8400, sentAt: "May 4, 7:30 PM" },
];

export function renderTemplate(body: string, firstName: string): string {
  return body
    .replace(/\{\{\s*client_name\s*\}\}/g, firstName)
    .replace(/\{\{\s*last_service\s*\}\}/g, "Hair gloss")
    .replace(/\{\{\s*preferred_stylist\s*\}\}/g, "Priya")
    .replace(/\{\{\s*points_balance\s*\}\}/g, "2,840");
}
