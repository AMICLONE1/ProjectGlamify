export type BusinessNavItem = {
  href: string;
  label: string;
  description: string;
};

export type BusinessMetric = {
  label: string;
  value: string;
  trend: string;
  tone: "emerald" | "amber" | "sky" | "rose";
};

export type BusinessScheduleItem = {
  time: string;
  client: string;
  service: string;
  staff: string;
  status: string;
};

export type BusinessAlert = {
  title: string;
  body: string;
  meta: string;
  tone: "emerald" | "amber" | "sky";
};

export type BusinessSectionStat = {
  label: string;
  value: string;
  detail: string;
  tone: "emerald" | "amber" | "sky" | "rose";
};

export type BusinessSectionHighlight = {
  title: string;
  body: string;
  meta: string;
  tone: "emerald" | "amber" | "sky" | "rose";
};

export type BusinessSectionAction = {
  href: string;
  label: string;
  detail: string;
};

export const businessNavigation: BusinessNavItem[] = [
  { href: "/business", label: "Dashboard", description: "Command center" },
  { href: "/business/calendar", label: "Calendar", description: "Staff columns & waitlist" },
  { href: "/business/clients", label: "Clients", description: "CRM, tags, history" },
  { href: "/business/pos", label: "POS", description: "Checkout & billing" },
  { href: "/business/inventory", label: "Inventory", description: "Stock, alerts, PO" },
  { href: "/business/campaigns", label: "Campaigns", description: "Segments & push" },
  { href: "/business/reports", label: "Reports", description: "Analytics & exports" },
  { href: "/business/staff", label: "Staff", description: "Shifts & commissions" },
  { href: "/business/mobile", label: "Mobile app", description: "Staff pocket view" },
  { href: "/business/settings", label: "Settings", description: "Profile & config" },
];

export const dashboardMetrics: BusinessMetric[] = [
  { label: "Revenue", value: "₹42,800", trend: "+12% vs yesterday", tone: "emerald" },
  { label: "Bookings", value: "38", trend: "5 walk-ins", tone: "sky" },
  { label: "Avg ticket", value: "₹1,127", trend: "+₹85 this week", tone: "amber" },
  { label: "No-show risk", value: "18%", trend: "2 at-risk slots", tone: "rose" },
];

export const dashboardSchedule: BusinessScheduleItem[] = [
  { time: "09:00", client: "Ananya Sharma", service: "Hair cut + gloss", staff: "Priya", status: "In progress" },
  { time: "09:30", client: "Karan Mehta", service: "Beard trim", staff: "Rohan", status: "Confirmed" },
  { time: "10:00", client: "Meera Joshi", service: "Hydra facial", staff: "Sneha", status: "Confirmed" },
  { time: "10:30", client: "Walk-in", service: "Mani + Pedi", staff: "Deepa", status: "Queued" },
  { time: "11:00", client: "Riya Kapoor", service: "Keratin treatment", staff: "Priya", status: "Confirmed" },
];

export const dashboardAlerts: BusinessAlert[] = [
  {
    title: "Tuesday fill opportunity",
    body: "Your 8-11 AM slots are underbooked by 23%. Offer a Tuesday-only bundle before you discount.",
    meta: "AI insight",
    tone: "sky",
  },
  {
    title: "Ananya S. is at risk",
    body: "She usually visits every 21 days. It has been 38 days now. Send a re-engagement offer.",
    meta: "Churn alert",
    tone: "amber",
  },
  {
    title: "Platinum developer low",
    body: "Inventory trends suggest you will run out of developer by Saturday unless you reorder four units.",
    meta: "Inventory",
    tone: "emerald",
  },
];

export const calendarStats: BusinessSectionStat[] = [
  { label: "Appointments today", value: "28", detail: "18 confirmed, 5 pending, 5 walk-ins", tone: "sky" },
  { label: "Rooms occupied", value: "6 / 8", detail: "Peak load from 11:30 AM to 3:00 PM", tone: "emerald" },
  { label: "Waitlist conversions", value: "71%", detail: "Most waitlist clients book within 12 minutes", tone: "amber" },
  { label: "Late arrivals", value: "3", detail: "Two slots can still be recovered", tone: "rose" },
];

export const calendarHighlights: BusinessSectionHighlight[] = [
  {
    title: "Morning queue is clean",
    body: "The 9:00-11:00 lane is fully staffed, with one flex stylist absorbing walk-ins before lunch.",
    meta: "Timeline",
    tone: "emerald",
  },
  {
    title: "Waitlist should move now",
    body: "Three clients are within 15 minutes of the salon. Push the first available slot before they leave the area.",
    meta: "Queue",
    tone: "amber",
  },
  {
    title: "Afternoon room swap",
    body: "Room 2 can be reassigned from facial to color between 2:00 PM and 4:00 PM without breaking the schedule.",
    meta: "Ops",
    tone: "sky",
  },
];

export const calendarActions: BusinessSectionAction[] = [
  { href: "/business/calendar", label: "Move booking", detail: "Drag to another stylist or room" },
  { href: "/business/calendar", label: "Open tomorrow", detail: "Review slot coverage and capacity" },
  { href: "/business/calendar", label: "Broadcast slot", detail: "Send an instant fill message to waitlist" },
];

export const clientStats: BusinessSectionStat[] = [
  { label: "Active clients", value: "1,248", detail: "312 visited in the last 30 days", tone: "emerald" },
  { label: "VIP members", value: "94", detail: "High-spend clients with priority access", tone: "sky" },
  { label: "At risk", value: "27", detail: "No visit for 45+ days", tone: "rose" },
  { label: "New this week", value: "36", detail: "Mostly from referrals and Instagram", tone: "amber" },
];

export const clientHighlights: BusinessSectionHighlight[] = [
  {
    title: "VIP bookers need recall loops",
    body: "The top 20 clients still drive 34% of revenue. Their next-best offer is a priority rebook reminder.",
    meta: "Retention",
    tone: "emerald",
  },
  {
    title: "Family clusters are rising",
    body: "Twelve client groups now share billing history and preferences, which makes rebooking faster at the desk.",
    meta: "CRM",
    tone: "sky",
  },
  {
    title: "Win-back target list",
    body: "Clients from the 45-60 day lapse bucket respond best to a service-plus-aftercare bundle.",
    meta: "Marketing",
    tone: "amber",
  },
];

export const clientActions: BusinessSectionAction[] = [
  { href: "/business/clients", label: "Add client", detail: "Create profile and preferences" },
  { href: "/business/clients", label: "Search segments", detail: "VIP, at risk, birthday, new" },
  { href: "/business/clients", label: "Send win-back", detail: "Push an offer to a selected cohort" },
];

export const posStats: BusinessSectionStat[] = [
  { label: "Sales today", value: "₹42,800", detail: "₹8,600 from walk-ins", tone: "emerald" },
  { label: "Pending payments", value: "5", detail: "Mostly UPI follow-ups", tone: "amber" },
  { label: "Average basket", value: "₹1,127", detail: "Up because of retail add-ons", tone: "sky" },
  { label: "GST ready", value: "100%", detail: "Invoices synced to tax format", tone: "rose" },
];

export const posHighlights: BusinessSectionHighlight[] = [
  {
    title: "Fast checkout is the default",
    body: "Suggested items and recent bundles are preloaded so the front desk can close payments in under a minute.",
    meta: "Checkout",
    tone: "emerald",
  },
  {
    title: "Split billing is ready",
    body: "Use two-payment support when a client pays part UPI and part card without breaking the invoice.",
    meta: "Payments",
    tone: "sky",
  },
  {
    title: "Open invoices are low",
    body: "Only five bills are pending. The oldest one is tied to a returning client and can be closed at checkout.",
    meta: "Collections",
    tone: "amber",
  },
];

export const posActions: BusinessSectionAction[] = [
  { href: "/business/pos", label: "Charge now", detail: "Open a payment-ready cart" },
  { href: "/business/pos", label: "Split bill", detail: "Allocate items across multiple payers" },
  { href: "/business/pos", label: "Create invoice", detail: "Generate GST-ready billing" },
];

export const inventoryStats: BusinessSectionStat[] = [
  { label: "Low stock items", value: "4", detail: "Two are critical by Saturday", tone: "rose" },
  { label: "Reorder alerts", value: "6", detail: "Stock below reorder threshold", tone: "amber" },
  { label: "Fast movers", value: "12", detail: "High-turn products in the last 7 days", tone: "emerald" },
  { label: "Waste rate", value: "3.1%", detail: "Below the 5% internal target", tone: "sky" },
];

export const inventoryHighlights: BusinessSectionHighlight[] = [
  {
    title: "Platinum developer is critical",
    body: "Usage is above forecast. Reorder before the weekend to avoid a color-service disruption.",
    meta: "Alert",
    tone: "rose",
  },
  {
    title: "Retail shelf is healthy",
    body: "Aftercare serum and heat protectant are moving quickly, but both still sit above the threshold.",
    meta: "Merchandise",
    tone: "emerald",
  },
  {
    title: "Stock audit due Friday",
    body: "A quick end-of-week count will keep shrinkage low and update the purchase order queue.",
    meta: "Operations",
    tone: "amber",
  },
];

export const inventoryActions: BusinessSectionAction[] = [
  { href: "/business/inventory", label: "Create PO", detail: "Place the next purchase order" },
  { href: "/business/inventory", label: "Log usage", detail: "Subtract consumed products" },
  { href: "/business/inventory", label: "Run audit", detail: "Check actual vs system stock" },
];

export const campaignStats: BusinessSectionStat[] = [
  { label: "Audience reach", value: "1,018", detail: "Eligible clients across three segments", tone: "sky" },
  { label: "Draft campaigns", value: "5", detail: "Two ready to launch today", tone: "amber" },
  { label: "Automations live", value: "4", detail: "Birthday, rebook, win-back, and post-visit", tone: "emerald" },
  { label: "ROI this month", value: "5.8x", detail: "Best performing offer is the Tuesday bundle", tone: "rose" },
];

export const campaignHighlights: BusinessSectionHighlight[] = [
  {
    title: "Tuesday fill campaign is the winner",
    body: "This message is filling off-peak slots without forcing broad discounts on the whole database.",
    meta: "Push",
    tone: "emerald",
  },
  {
    title: "Birthday offers are warm",
    body: "Clients with birthdays in the next seven days open offers more often when service credits are included.",
    meta: "Lifecycle",
    tone: "sky",
  },
  {
    title: "Win-back list needs refresh",
    body: "The 45-day lapse cohort is ready for a tighter offer with a clearer booking deadline.",
    meta: "Recovery",
    tone: "amber",
  },
];

export const campaignActions: BusinessSectionAction[] = [
  { href: "/business/campaigns", label: "Launch push", detail: "Send to a saved segment" },
  { href: "/business/campaigns", label: "Schedule SMS", detail: "Queue a timed follow-up" },
  { href: "/business/campaigns", label: "Review funnel", detail: "Track opens, taps, and rebooks" },
];

export const reportStats: BusinessSectionStat[] = [
  { label: "Revenue", value: "₹12.4L", detail: "Month to date across all branches", tone: "emerald" },
  { label: "Retention", value: "68%", detail: "Returning client share this month", tone: "sky" },
  { label: "Campaign ROI", value: "5.8x", detail: "Best campaign is the Tuesday bundle", tone: "amber" },
  { label: "Waste", value: "3.1%", detail: "Below the target threshold", tone: "rose" },
];

export const reportHighlights: BusinessSectionHighlight[] = [
  {
    title: "Service mix stayed balanced",
    body: "High-ticket smoothing services and quick-turn grooming kept average ticket size above target.",
    meta: "Performance",
    tone: "emerald",
  },
  {
    title: "Branch trend is stable",
    body: "The main branch continues to outperform due to stronger walk-in capture and better rebooking.",
    meta: "Branch health",
    tone: "sky",
  },
  {
    title: "Weekly export is ready",
    body: "Finance can export the report pack to PDF or CSV without any extra cleanup work.",
    meta: "Exports",
    tone: "amber",
  },
];

export const reportActions: BusinessSectionAction[] = [
  { href: "/business/reports", label: "Export PDF", detail: "Send a board-ready summary" },
  { href: "/business/reports", label: "Open weekly", detail: "Inspect the last seven days" },
  { href: "/business/reports", label: "Compare branches", detail: "View performance side by side" },
];

export const staffStats: BusinessSectionStat[] = [
  { label: "Team online", value: "14", detail: "12 scheduled and 2 floating", tone: "emerald" },
  { label: "Utilization", value: "82%", detail: "Peak load sits in the afternoon", tone: "sky" },
  { label: "Commission due", value: "₹1.8L", detail: "Auto-calculated from revenue share", tone: "amber" },
  { label: "Open shifts", value: "3", detail: "Weekend coverage is still flexible", tone: "rose" },
];

export const staffHighlights: BusinessSectionHighlight[] = [
  {
    title: "Priya is fully booked",
    body: "Her column is at capacity until late afternoon, so any reassignments should go to the flex lane.",
    meta: "Roster",
    tone: "emerald",
  },
  {
    title: "Two staff swaps pending",
    body: "Approve the open exchange before tomorrow’s shift cutoff and the schedule will stay balanced.",
    meta: "Approvals",
    tone: "amber",
  },
  {
    title: "Commission summary is clear",
    body: "Everyone’s payout is linked to services and product sales, so finance can close the month faster.",
    meta: "Payroll",
    tone: "sky",
  },
];

export const staffActions: BusinessSectionAction[] = [
  { href: "/business/staff", label: "Publish roster", detail: "Send the live schedule to staff" },
  { href: "/business/staff", label: "Approve swap", detail: "Confirm a shift exchange" },
  { href: "/business/staff", label: "View payouts", detail: "Check commission by staff member" },
];

export const settingsStats: BusinessSectionStat[] = [
  { label: "Branches", value: "3", detail: "All set up in the same workspace", tone: "sky" },
  { label: "Integrations", value: "6", detail: "Payments, realtime, analytics, AI, and alerts", tone: "emerald" },
  { label: "Roles", value: "5", detail: "Owner, manager, front desk, stylist, marketing", tone: "amber" },
  { label: "Uptime", value: "99.9%", detail: "Core services are healthy today", tone: "rose" },
];

export const settingsHighlights: BusinessSectionHighlight[] = [
  {
    title: "Business profile controls",
    body: "Keep the logo, brand name, hours, and tax identity aligned across invoices and booking pages.",
    meta: "Profile",
    tone: "emerald",
  },
  {
    title: "Access is role-based",
    body: "The owner can open every module, while the front desk only sees what they need for the day.",
    meta: "Security",
    tone: "amber",
  },
  {
    title: "Integrations are visible",
    body: "Supabase, Razorpay, notifications, and AI hooks are grouped so setup stays manageable.",
    meta: "Connections",
    tone: "sky",
  },
];

export const settingsActions: BusinessSectionAction[] = [
  { href: "/business/settings", label: "Edit profile", detail: "Name, address, logo, hours" },
  { href: "/business/settings", label: "Manage roles", detail: "Access control by staff type" },
  { href: "/business/settings", label: "Review integrations", detail: "Check external connections" },
];

export const mobileStats: BusinessSectionStat[] = [
  { label: "Offline sync", value: "On", detail: "Data still updates when connection returns", tone: "emerald" },
  { label: "Check-ins", value: "12", detail: "Fast attendance capture for staff", tone: "sky" },
  { label: "Payment shortcuts", value: "4", detail: "UPI, card, cash, and split pay", tone: "amber" },
  { label: "Push alerts", value: "Live", detail: "Shift reminders and booking changes", tone: "rose" },
];

export const mobileHighlights: BusinessSectionHighlight[] = [
  {
    title: "Phone-first overview",
    body: "The staff app shows the next booking, the queue, and quick payment buttons on one screen.",
    meta: "Preview",
    tone: "emerald",
  },
  {
    title: "Works offline for the desk",
    body: "Temporary signal loss should not stop attendance, notes, or checkouts from being captured.",
    meta: "Reliability",
    tone: "amber",
  },
  {
    title: "Approvals stay simple",
    body: "Managers can confirm swaps and mark arrivals without leaving the mobile view.",
    meta: "Workflow",
    tone: "sky",
  },
];

export const mobileActions: BusinessSectionAction[] = [
  { href: "/business/mobile", label: "Open preview", detail: "Inspect the phone layout" },
  { href: "/business/mobile", label: "Test push", detail: "Simulate a booking update" },
  { href: "/business/mobile", label: "Install app", detail: "Prepare the staff onboarding flow" },
];
