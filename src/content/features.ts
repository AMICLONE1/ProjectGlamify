export type FeatureCategory =
  | "Operations"
  | "Clients"
  | "Growth"
  | "Intelligence";

export type Feature = {
  slug: string;
  category: FeatureCategory;
  eyebrow: string;
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  capabilities: { title: string; body: string }[];
  tier: "Starter+" | "Growth+" | "Professional+" | "Enterprise";
  related: string[];
};

export const features: Feature[] = [
  {
    slug: "ai-scheduling",
    category: "Intelligence",
    eyebrow: "AI Scheduling",
    title: "A calendar that fills itself.",
    tagline: "Smart slot suggestions, no-show prediction, and auto-waitlist.",
    description:
      "Glamify's AI watches your staff utilization, historical bookings, and client patterns to suggest the slots that will actually fill — not just the ones that are empty. When risk of a no-show climbs, you'll know before the client does.",
    bullets: [
      "Smart slot suggestions that maximize staff utilization",
      "No-show prediction with risk scoring (0–100) per appointment",
      "Auto-waitlist offers when a slot opens",
      "Real-time conflict detection across staff + resources",
    ],
    capabilities: [
      {
        title: "Gap analysis",
        body: "Identifies underutilized slots in each stylist's day and surfaces them first when a new booking comes in.",
      },
      {
        title: "Weather-aware predictions",
        body: "Monsoon Tuesdays in Mumbai? Glamify already knows your no-show rate spikes 30% — and warns you about it.",
      },
      {
        title: "Waitlist auto-fill",
        body: "When a regular cancels, Glamify offers the slot to matching waitlisted clients within 60 seconds.",
      },
    ],
    tier: "Growth+",
    related: ["pos-billing", "crm", "consumer-app"],
  },
  {
    slug: "pos-billing",
    category: "Operations",
    eyebrow: "POS & Billing",
    title: "30-second checkout, every time.",
    tagline: "GST-compliant invoices, UPI QR, split bills, refunds.",
    description:
      "Glamify's POS is built for the rhythm of a busy salon. Select the client, add services and products, apply a discount, split the payment, and generate a GST invoice — all without leaving the receptionist's keyboard.",
    bullets: [
      "Quick-checkout flow under 30 seconds",
      "Split billing across multiple payment methods",
      "GST-compliant invoices with HSN codes",
      "UPI QR via Razorpay, cash, card, gift card",
      "Tip management with staff attribution",
      "End-of-day cash drawer reconciliation",
    ],
    capabilities: [
      {
        title: "Razorpay UPI integration",
        body: "Generate UPI QR or payment links per invoice. Webhook auto-marks paid. Zero manual reconciliation.",
      },
      {
        title: "Refunds and credit notes",
        body: "Issue refunds against the original payment method, or convert to wallet credit for future visits.",
      },
      {
        title: "Audit trail",
        body: "Every billing change is logged with user, timestamp, and IP. Compliance-ready for tax audits.",
      },
    ],
    tier: "Starter+",
    related: ["ai-scheduling", "loyalty", "reports"],
  },
  {
    slug: "crm",
    category: "Clients",
    eyebrow: "Client CRM",
    title: "Remember every client.",
    tagline: "Profiles, history, preferences, allergies, family links.",
    description:
      "Every client's story in one place. Visit history, total spend, preferred stylists, allergies, family members, and a communication log of every reminder and offer they've received.",
    bullets: [
      "Full profile: contact, photo, history, preferences, notes",
      "Spend analytics per client (LTV, avg ticket, visit frequency)",
      "Family/group linking (mother-daughter, couples)",
      "Custom tags and computed segments (VIP, At-Risk, New)",
      "Full-text search by name or phone (sub-100ms)",
    ],
    capabilities: [
      {
        title: "Allergy & sensitivity notes",
        body: "Bubble up critical client notes at the top of every appointment so stylists never miss a sensitivity.",
      },
      {
        title: "Family wallets",
        body: "Link related clients so loyalty points and membership benefits can be shared (configurable).",
      },
      {
        title: "Communication log",
        body: "See every push, SMS, WhatsApp, and email a client has received from your business in one timeline.",
      },
    ],
    tier: "Starter+",
    related: ["loyalty", "marketing", "ai-scheduling"],
  },
  {
    slug: "inventory",
    category: "Operations",
    eyebrow: "Inventory",
    title: "Stock that tracks itself.",
    tagline: "Real-time stock, service consumption, expiry alerts, demand forecasting.",
    description:
      "Glamify auto-deducts product quantities when services complete (one hair color session = X grams of developer used). Get low-stock alerts before you run out, expiry warnings before you waste, and AI-suggested reorder quantities.",
    bullets: [
      "Real-time stock tracking with low-stock alerts",
      "Service-linked auto-consumption",
      "Purchase orders with supplier directory",
      "Expiry tracking with 30/15/7-day warnings",
      "Multi-location stock transfers",
      "AI demand forecasting based on appointment pipeline",
    ],
    capabilities: [
      {
        title: "Product-service mapping",
        body: "Define which products a service consumes and how much. POS auto-deducts on invoice creation.",
      },
      {
        title: "Wastage analytics",
        body: "Identify products with high discard rates and adjust purchasing patterns.",
      },
      {
        title: "Batch tracking",
        body: "Track expiry dates per batch. Older batches get used first via FIFO recommendations.",
      },
    ],
    tier: "Professional+",
    related: ["pos-billing", "reports", "ai-scheduling"],
  },
  {
    slug: "loyalty",
    category: "Growth",
    eyebrow: "Loyalty & Memberships",
    title: "Make them come back.",
    tagline: "Points, memberships, packages, gift cards, referrals.",
    description:
      "Glamify's loyalty engine handles every retention play — points-based rewards, tiered memberships with member pricing, prepaid service packages with session tracking, digital gift cards, and a referral program that rewards both sides.",
    bullets: [
      "Points-based loyalty with configurable earn/burn ratios",
      "Tiered memberships (monthly/annual)",
      "Prepaid service packages with session tracking",
      "Digital gift cards with custom values and expiry",
      "Referral program with reward attribution",
      "Loyalty wallet in the consumer app",
    ],
    capabilities: [
      {
        title: "Member-only pricing",
        body: "Members automatically see discounted prices at checkout. No manual codes to apply.",
      },
      {
        title: "Auto-renewal",
        body: "Memberships renew via stored UPI mandates. Failed renewals trigger graceful grace-period flows.",
      },
      {
        title: "Referral attribution",
        body: "Track which clients drive new business. Reward both referrer and referee on first paid visit.",
      },
    ],
    tier: "Growth+",
    related: ["crm", "consumer-app", "marketing"],
  },
  {
    slug: "marketing",
    category: "Growth",
    eyebrow: "Marketing",
    title: "Campaigns that write themselves.",
    tagline: "Segments, templates, AI copy, push, WhatsApp, SMS.",
    description:
      "Segment your clients by spend, visit frequency, last visit, birthday, or any custom tag. Use a template or let AI write the copy. Push to the consumer app for free, or send via WhatsApp/SMS as paid add-ons. Track open rates, redemption, and attributed revenue.",
    bullets: [
      "Visual segment builder",
      "Pre-built campaign templates (birthday, win-back, festive)",
      "AI-generated marketing copy",
      "Free unlimited in-app push notifications",
      "WhatsApp Business API integration (add-on)",
      "Campaign analytics with revenue attribution",
    ],
    capabilities: [
      {
        title: "Optimal send-time",
        body: "AI analyzes historical engagement and recommends the best hour-of-day to push per segment.",
      },
      {
        title: "A/B testing",
        body: "Test two offer structures on splits of your segment. Promote the winner automatically.",
      },
      {
        title: "Revenue attribution",
        body: "Track revenue from clients who received a campaign within 7 days of their next visit.",
      },
    ],
    tier: "Growth+",
    related: ["crm", "loyalty", "consumer-app"],
  },
  {
    slug: "staff",
    category: "Operations",
    eyebrow: "Staff Management",
    title: "Your team, organized.",
    tagline: "Profiles, shifts, commissions, attendance, performance.",
    description:
      "Manage every aspect of your team — skills and certifications, shift rosters with drag-and-drop, attendance tracking via mobile, commission structures (flat, percentage, tiered), and performance dashboards.",
    bullets: [
      "Staff profiles with skills and service assignments",
      "Drag-and-drop shift management",
      "Mobile check-in/check-out (geofenced optional)",
      "Flexible commission rules engine",
      "Performance dashboards per staff",
      "Leave management with auto-calendar blocking",
    ],
    capabilities: [
      {
        title: "Commission rules engine",
        body: "Mix flat, percentage, and tiered rules per service and per staff member. Calculated automatically at invoice.",
      },
      {
        title: "Goal tracking",
        body: "Set monthly revenue or service-count goals per stylist. Visual progress bars in the staff app.",
      },
      {
        title: "Utilization analytics",
        body: "See exactly which stylists are over- and under-booked. Reallocate slots to balance the team.",
      },
    ],
    tier: "Growth+",
    related: ["ai-scheduling", "reports", "multi-location"],
  },
  {
    slug: "reports",
    category: "Intelligence",
    eyebrow: "Reports & Analytics",
    title: "Numbers you'll actually read.",
    tagline: "Dashboard KPIs, custom reports, AI insights, anomaly detection.",
    description:
      "A real-time dashboard with today's revenue, appointments, and AI insights. Standard reports for revenue, clients, staff, inventory. A custom report builder for the questions only you ask. And natural-language insights that explain the why behind the numbers.",
    bullets: [
      "Real-time KPI dashboard",
      "30+ pre-built standard reports",
      "Drag-and-drop custom report builder",
      "Scheduled email reports (daily, weekly, monthly)",
      "CSV/Excel export for everything",
      "AI natural-language insights",
      "Anomaly detection on revenue and bookings",
    ],
    capabilities: [
      {
        title: "Plain-English insights",
        body: "\"Your Tuesdays are 23% underbooked vs the rest of the week.\" Real findings, not chart noise.",
      },
      {
        title: "Anomaly detection",
        body: "Z-score analysis flags unusual patterns — sudden revenue drops, inventory variance, billing spikes.",
      },
      {
        title: "Revenue forecasting",
        body: "Projects this month's revenue based on current booking pipeline and historical conversion.",
      },
    ],
    tier: "Growth+",
    related: ["ai-scheduling", "staff", "multi-location"],
  },
  {
    slug: "multi-location",
    category: "Operations",
    eyebrow: "Multi-Location",
    title: "Run every branch as one.",
    tagline: "Centralized control, per-location pricing, franchise mode.",
    description:
      "Glamify's multi-location architecture lets you run two or twenty branches from one dashboard. Clients are recognized across all locations. Inventory, staff, and pricing can be centralized or decentralized per branch.",
    bullets: [
      "Centralized dashboard with per-location drill-down",
      "Location-specific pricing, services, staff",
      "Inter-location client recognition",
      "Consolidated and per-location reporting",
      "Centralized vs decentralized inventory",
      "Franchise mode with separate P&L views",
    ],
    capabilities: [
      {
        title: "Franchise mode",
        body: "Separate P&L visibility per location with aggregate roll-up reporting for the franchisor.",
      },
      {
        title: "Stock transfers",
        body: "Move inventory between branches with approval workflows. Track in-transit stock in real time.",
      },
      {
        title: "Cross-branch booking",
        body: "Clients can book at any of your branches via the consumer app. Profile follows them everywhere.",
      },
    ],
    tier: "Professional+",
    related: ["staff", "inventory", "reports"],
  },
  {
    slug: "consumer-app",
    category: "Growth",
    eyebrow: "Consumer App",
    title: "Your salon, in their pocket.",
    tagline: "Booking, loyalty, receipts, reviews — all in a beautiful mobile app.",
    description:
      "A native iOS and Android app for your clients. They book in two taps, see their loyalty wallet, access digital receipts, and rebook past appointments with one button. Branded with your salon's name on paid plans.",
    bullets: [
      "OTP login via phone number",
      "Browse services and book in 2 taps",
      "1-tap rebooking of past appointments",
      "Loyalty wallet, memberships, packages",
      "Digital receipts auto-pushed after every visit",
      "Push notification reminders",
      "Review and rating system",
    ],
    capabilities: [
      {
        title: "QR linking",
        body: "Clients scan a QR at your reception to instantly link to your salon and complete their profile.",
      },
      {
        title: "Multi-business support",
        body: "One client account can link to multiple salons. Your salon stays prominent in their app.",
      },
      {
        title: "Offline-resilient",
        body: "Appointments, loyalty balance, and profile work offline. Booking requires connectivity.",
      },
    ],
    tier: "Starter+",
    related: ["loyalty", "marketing", "crm"],
  },
];

export function getFeatureBySlug(slug: string): Feature | undefined {
  return features.find((f) => f.slug === slug);
}

export function getFeatureSlugs(): string[] {
  return features.map((f) => f.slug);
}

export function getRelatedFeatures(slugs: string[]): Feature[] {
  return slugs
    .map((s) => getFeatureBySlug(s))
    .filter((f): f is Feature => f !== undefined);
}

export const categoryOrder: FeatureCategory[] = [
  "Operations",
  "Clients",
  "Growth",
  "Intelligence",
];
