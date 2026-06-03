// Plain data module (no "use client") so both Server Components (for FAQ JSON-LD)
// and Client Components (for the interactive accordion) can import the same source.

export type Faq = { q: string; a: string };

export const homeFaqs: Faq[] = [
  {
    q: "Is there really a free plan?",
    a: "Yes. The Starter plan is free forever for solo professionals — one staff seat, basic booking and billing, and up to 50 appointments a month. No card needed. Upgrade only when you need more.",
  },
  {
    q: "How long does setup take?",
    a: "Most businesses are live in under 15 minutes. Our guided wizard walks you through services, staff, working hours, and GST settings. We import data from spreadsheets too — message us and we'll do it for you.",
  },
  {
    q: "Do I need separate apps for my staff and my clients?",
    a: "Yes, and they're both included. Staff get the Clitell Business app for schedule and quick billing. Your clients get the Clitell consumer app — branded with your salon's name on paid plans.",
  },
  {
    q: "Does Clitell handle GST invoicing?",
    a: "Built in. Configure your GSTIN once and every invoice is GST-compliant with HSN codes, CGST/SGST breakup, and digital signatures. Export reports for your CA in one click.",
  },
  {
    q: "Which payment methods do you support?",
    a: "UPI via Razorpay is integrated at launch — QR codes, payment links, and webhook reconciliation. Cash, card, and wallet tracking is also available. International payments are on the roadmap.",
  },
  {
    q: "What about my existing client list?",
    a: "Upload a CSV or Excel file and Clitell will import it with phone numbers, visit history, notes, and tags. Or we'll migrate from Dingg, Zenoti, or any other software for free during onboarding.",
  },
  {
    q: "Is my client data safe?",
    a: "Yes. Clitell is fully DPDPA-compliant. Client PII is encrypted at rest, payment data never touches our servers (PCI compliance via Razorpay), and you can export or delete data at any time.",
  },
  {
    q: "Can I switch plans later?",
    a: "Anytime, up or down. No long-term contracts, no exit fees. If you cancel, you keep read-only access to your data for 90 days and a full export anytime.",
  },
];

export const pricingFaqs: Faq[] = [
  { q: "Is the free plan really free forever?", a: "Yes. The Starter plan stays free with no time limit and no card required. It's designed for solo professionals — one staff seat, up to 50 appointments per month, basic booking and billing, and access to the consumer app for your clients." },
  { q: "Can I switch plans later?", a: "Anytime. Upgrade instantly when you need more seats or AI features. Downgrade at the end of any billing cycle with no penalty. Your data and history stay intact." },
  { q: "Do you offer annual billing discounts?", a: "Yes — pay annually and save 20% across all paid tiers. Growth annual works out to ₹1,199/month equivalent, Professional to ₹3,199/month equivalent." },
  { q: "What happens if I exceed the Starter plan's 50 appointments?", a: "We'll prompt you to upgrade when you hit 45 appointments. If you exceed 50, bookings continue to work but you'll see a friendly upgrade banner. We don't cut you off mid-day." },
  { q: "Are payment processing fees included?", a: "Razorpay's standard UPI processing rates apply directly to your transactions (no markup from us on Growth and Professional). Enterprise plans can negotiate bulk rates with Razorpay through us." },
  { q: "How does the 14-day trial work for paid plans?", a: "Click 'Start free trial' on any paid plan, set up your business, and use all features for 14 days. No card required to start. If you don't subscribe, we'll automatically convert you to the free Starter plan with your data intact." },
  { q: "What about WhatsApp Business API and SMS?", a: "These run through third-party gateways (charged per message) and are available as paid add-ons on Growth and Professional. Enterprise plans include a base allotment. Pricing varies by message volume." },
  { q: "Do you offer non-profit or small business discounts?", a: "Registered non-profits and women-led salons in Tier-2/3 cities get 30% off paid plans for the first year. Email hello@clitell.in with proof of registration." },
];
