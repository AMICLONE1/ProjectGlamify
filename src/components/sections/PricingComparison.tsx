"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

type Row = {
  feature: string;
  starter: string | boolean;
  growth: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
};

type Group = { title: string; rows: Row[] };

const groups: Group[] = [
  {
    title: "Core",
    rows: [
      { feature: "Staff seats", starter: "1", growth: "5", pro: "15", enterprise: "Unlimited" },
      { feature: "Locations", starter: "1", growth: "1", pro: "2", enterprise: "Unlimited" },
      { feature: "Monthly appointments", starter: "50", growth: "Unlimited", pro: "Unlimited", enterprise: "Unlimited" },
      { feature: "Consumer app access", starter: true, growth: true, pro: true, enterprise: true },
      { feature: "Clitell branding on app", starter: "Shown", growth: "Removed", pro: "Removed", enterprise: "Custom" },
    ],
  },
  {
    title: "Bookings & POS",
    rows: [
      { feature: "Drag-and-drop calendar", starter: true, growth: true, pro: true, enterprise: true },
      { feature: "Walk-in queue", starter: true, growth: true, pro: true, enterprise: true },
      { feature: "Recurring bookings", starter: false, growth: true, pro: true, enterprise: true },
      { feature: "UPI payments (Razorpay)", starter: true, growth: true, pro: true, enterprise: true },
      { feature: "GST invoicing", starter: true, growth: true, pro: true, enterprise: true },
      { feature: "Split payments + tips", starter: false, growth: true, pro: true, enterprise: true },
      { feature: "Cash drawer & EOD reconciliation", starter: false, growth: true, pro: true, enterprise: true },
    ],
  },
  {
    title: "Clients & loyalty",
    rows: [
      { feature: "Client profiles", starter: "Unlimited", growth: "Unlimited", pro: "Unlimited", enterprise: "Unlimited" },
      { feature: "Visit history & notes", starter: true, growth: true, pro: true, enterprise: true },
      { feature: "Loyalty points", starter: false, growth: true, pro: true, enterprise: true },
      { feature: "Memberships & packages", starter: false, growth: true, pro: true, enterprise: true },
      { feature: "Gift cards", starter: false, growth: true, pro: true, enterprise: true },
      { feature: "Family/group linking", starter: false, growth: false, pro: true, enterprise: true },
    ],
  },
  {
    title: "AI & automation",
    rows: [
      { feature: "Smart slot suggestions", starter: false, growth: true, pro: true, enterprise: true },
      { feature: "No-show prediction", starter: false, growth: false, pro: true, enterprise: true },
      { feature: "Churn alerts", starter: false, growth: false, pro: true, enterprise: true },
      { feature: "Demand forecasting", starter: false, growth: false, pro: true, enterprise: true },
      { feature: "AI marketing copywriter", starter: false, growth: false, pro: true, enterprise: true },
      { feature: "Dynamic pricing", starter: false, growth: false, pro: false, enterprise: true },
      { feature: "AI assistant (natural language)", starter: false, growth: false, pro: false, enterprise: true },
    ],
  },
  {
    title: "Staff & inventory",
    rows: [
      { feature: "Commission engine", starter: false, growth: true, pro: true, enterprise: true },
      { feature: "Shift & roster management", starter: false, growth: true, pro: true, enterprise: true },
      { feature: "Attendance tracking", starter: false, growth: true, pro: true, enterprise: true },
      { feature: "Inventory management", starter: false, growth: false, pro: true, enterprise: true },
      { feature: "Purchase orders & suppliers", starter: false, growth: false, pro: true, enterprise: true },
      { feature: "Multi-location stock transfers", starter: false, growth: false, pro: false, enterprise: true },
    ],
  },
  {
    title: "Marketing & reports",
    rows: [
      { feature: "In-app push campaigns", starter: false, growth: true, pro: true, enterprise: true },
      { feature: "Client segmentation", starter: false, growth: true, pro: true, enterprise: true },
      { feature: "Standard reports", starter: false, growth: true, pro: true, enterprise: true },
      { feature: "Custom report builder", starter: false, growth: false, pro: true, enterprise: true },
      { feature: "Scheduled report emails", starter: false, growth: false, pro: true, enterprise: true },
      { feature: "WhatsApp / SMS add-on", starter: false, growth: "Paid", pro: "Paid", enterprise: "Included" },
    ],
  },
  {
    title: "Support & extras",
    rows: [
      { feature: "Email support", starter: true, growth: true, pro: true, enterprise: true },
      { feature: "Live chat support", starter: false, growth: true, pro: true, enterprise: true },
      { feature: "Dedicated account manager", starter: false, growth: false, pro: false, enterprise: true },
      { feature: "REST API access", starter: false, growth: false, pro: false, enterprise: true },
      { feature: "SLA & uptime guarantee", starter: false, growth: false, pro: false, enterprise: true },
      { feature: "Onboarding & data migration", starter: "Self-serve", growth: "Self-serve", pro: "Assisted", enterprise: "White-glove" },
    ],
  },
];

const tiers = [
  { name: "Starter", price: "₹0", sub: "forever" },
  { name: "Growth", price: "₹1,499", sub: "/mo" },
  { name: "Professional", price: "₹3,999", sub: "/mo", highlight: true },
  { name: "Enterprise", price: "Custom", sub: "" },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <span className="text-brand-500 font-bold" aria-label="Included">✓</span>;
  if (value === false) return <span className="text-border-strong" aria-label="Not included">—</span>;
  return <span className="text-foreground text-xs sm:text-sm">{value}</span>;
}

export function PricingComparison() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="py-20 sm:py-24 border-t border-border">
      <Container>
        <div className="max-w-3xl mb-10">
          <p className="eyebrow mb-6">Plan comparison</p>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95]">
            Every feature, side by side.
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="overflow-x-auto rounded-3xl border border-border bg-surface"
        >
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-border-strong">
                <th className="text-left p-5 text-xs uppercase tracking-[0.18em] text-muted font-semibold w-[28%]">
                  Feature
                </th>
                {tiers.map((tier) => (
                  <th
                    key={tier.name}
                    className={`text-center p-5 align-bottom ${tier.highlight ? "bg-brand-50" : ""}`}
                  >
                    <div className="text-[10px] uppercase tracking-[0.18em] text-brand-600 mb-2 font-semibold">
                      {tier.name}
                    </div>
                    <div className="font-display text-2xl font-extrabold text-ink">
                      {tier.price}
                      {tier.sub && <span className="text-sm text-muted font-medium ml-1">{tier.sub}</span>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((group, gi) => (
                <Fragment key={`group-${gi}`}>
                  <tr className="border-t border-border-strong bg-surface-2/40">
                    <th
                      colSpan={5}
                      className="text-left p-4 pt-5 text-xs uppercase tracking-[0.18em] text-ink font-bold"
                    >
                      {group.title}
                    </th>
                  </tr>
                  {group.rows.map((row, ri) => (
                    <tr key={`row-${gi}-${ri}`} className="border-t border-border hover:bg-surface-2/50 transition-colors">
                      <td className="p-4 text-sm text-foreground">{row.feature}</td>
                      <td className="p-4 text-center"><Cell value={row.starter} /></td>
                      <td className="p-4 text-center"><Cell value={row.growth} /></td>
                      <td className="p-4 text-center bg-brand-50/50"><Cell value={row.pro} /></td>
                      <td className="p-4 text-center"><Cell value={row.enterprise} /></td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </motion.div>

        <p className="mt-6 text-center text-sm text-muted">
          Prices in INR, exclusive of GST. Annual billing saves 20%.{" "}
          <a href="/contact" className="text-brand-600 hover:text-brand-700 underline underline-offset-4 font-medium">
            Talk to sales for Enterprise →
          </a>
        </p>
      </Container>
    </Section>
  );
}
