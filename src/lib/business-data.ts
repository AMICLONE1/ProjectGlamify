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

export const businessNavigation: BusinessNavItem[] = [
  { href: "/business", label: "Dashboard", description: "Command center" },
  { href: "/business/calendar", label: "Calendar", description: "Staff columns & waitlist" },
  { href: "/business/clients", label: "Clients", description: "CRM, tags, history" },
  { href: "/business/pos", label: "POS", description: "Checkout & billing" },
  { href: "/business/inventory", label: "Inventory", description: "Stock, alerts, PO" },
  { href: "/business/campaigns", label: "Campaigns", description: "Segments & push" },
  { href: "/business/reports", label: "Reports", description: "Analytics & exports" },
  { href: "/business/staff", label: "Staff", description: "Shifts & commissions" },
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
