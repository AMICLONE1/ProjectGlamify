export type Solution = {
  slug: string;
  title: string;
  category: string;
  hero: string;
  tagline: string;
  description: string;
  painPoints: { title: string; body: string }[];
  features: string[];
  testimonial?: { quote: string; name: string; business: string; initials: string };
};

export const solutions: Record<string, Solution> = {
  salon: {
    slug: "salon",
    category: "Salons",
    title: "Salon software, finally beautiful.",
    hero: "Glamify for salons",
    tagline:
      "From single-chair shops to multi-location chains — run every booking, bill, and client relationship in one place.",
    description:
      "Whether you're a unisex salon in Pune or a women's-only chain in Bengaluru, Glamify handles your unique workflow. Service catalogs with variants. Stylist preferences. Walk-ins alongside scheduled. Loyalty that keeps regulars coming back.",
    painPoints: [
      {
        title: "WhatsApp chaos",
        body: "Customers ping you for appointments at 11pm and you forget by morning. Glamify takes online bookings 24/7.",
      },
      {
        title: "Paper register losses",
        body: "Lost sheets, smudged totals, and zero idea which services actually make money. Glamify shows you, by stylist and by chair.",
      },
      {
        title: "No-shows hurting revenue",
        body: "AI predicts which appointments will no-show and prompts confirmations. Drop your no-show rate by up to 40%.",
      },
    ],
    features: ["ai-scheduling", "pos-billing", "crm", "loyalty", "staff", "consumer-app"],
    testimonial: {
      quote:
        "We switched from a paper register and three WhatsApp groups to Glamify. Our no-shows dropped 40% in two months and I finally know which services actually make me money.",
      name: "Priya Mehta",
      business: "Studio P Salon, Bandra",
      initials: "PM",
    },
  },
  spa: {
    slug: "spa",
    category: "Spas",
    title: "Spa software that flows.",
    hero: "Glamify for spas & wellness",
    tagline:
      "Memberships, packages, room scheduling, and therapist commissions — purpose-built for spa operations.",
    description:
      "Spas need software that handles rooms as well as therapists, packages as well as services, and membership renewals as well as walk-ins. Glamify does all of it with a calm UX that matches your spa's energy.",
    painPoints: [
      {
        title: "Room and therapist conflicts",
        body: "Standard software books therapists but ignores room availability. Glamify checks both simultaneously.",
      },
      {
        title: "Package session tracking",
        body: "Manually counting which of the 10 facials your member has used? Glamify tracks it automatically.",
      },
      {
        title: "Membership renewal leakage",
        body: "Members forget to renew. Glamify auto-charges via UPI mandate and sends grace-period reminders.",
      },
    ],
    features: ["ai-scheduling", "loyalty", "crm", "consumer-app", "staff", "reports"],
    testimonial: {
      quote:
        "The staff app changed our front desk. New receptionists are productive in a day, not a week. And the consumer app means our regulars finally stopped texting me for appointments.",
      name: "Sneha Iyer",
      business: "Bloom Wellness, Bengaluru",
      initials: "SI",
    },
  },
  clinic: {
    slug: "clinic",
    category: "Clinics",
    title: "Clinic software with compliance built in.",
    hero: "Glamify for beauty clinics",
    tagline:
      "Client allergies, treatment histories, GST-compliant billing, and consent tracking — all secure, all compliant.",
    description:
      "Beauty and skin clinics need the same operational features as salons plus medical-grade record keeping. Glamify keeps client history, allergies, treatment sequences, and consent forms — all DPDPA-compliant and encrypted at rest.",
    painPoints: [
      {
        title: "Treatment history scattered",
        body: "Paper files, multiple systems, missing notes. Glamify consolidates every client's full medical history.",
      },
      {
        title: "Allergy oversights",
        body: "Forgetting a client's allergy is a liability. Glamify surfaces allergies at the top of every appointment.",
      },
      {
        title: "Consent form chaos",
        body: "Digital consent capture with timestamp and signature. Stored encrypted, retrievable on demand.",
      },
    ],
    features: ["crm", "pos-billing", "reports", "consumer-app", "staff", "multi-location"],
  },
  barbershop: {
    slug: "barbershop",
    category: "Barbershops",
    title: "Barbershop software that keeps up.",
    hero: "Glamify for barbershops",
    tagline:
      "Walk-in queue, fast checkout, and stylist commission tracking — built for the pace of a busy barbershop.",
    description:
      "Barbershops move fast. Walk-ins dominate. Glamify's walk-in queue shows real-time wait estimates, lets clients see their position via SMS, and processes payments in under 30 seconds.",
    painPoints: [
      {
        title: "Walk-in queue confusion",
        body: "Who's next? Glamify's queue shows position and estimated wait. Clients see it on their phone.",
      },
      {
        title: "Cash management",
        body: "End-of-day reconciliation with cash drawer, UPI, and card breakup. No more manual tallying.",
      },
      {
        title: "Stylist commission disputes",
        body: "Configurable commission rules calculated automatically per service. Transparent, undisputable.",
      },
    ],
    features: ["pos-billing", "staff", "ai-scheduling", "crm", "loyalty"],
  },
  tattoo: {
    slug: "tattoo",
    category: "Tattoo Studios",
    title: "Tattoo studio management, refined.",
    hero: "Glamify for tattoo studios",
    tagline:
      "Deposits, custom artist portfolios, consent forms, and aftercare follow-ups — modernise your studio.",
    description:
      "Tattoo studios have unique workflows — deposits to lock the slot, hour-based pricing, custom artwork sessions, consent forms, and aftercare follow-ups. Glamify handles all of it.",
    painPoints: [
      {
        title: "Deposit collection",
        body: "Send a UPI link with the booking. Auto-confirm when the deposit is paid. No more chasing.",
      },
      {
        title: "Artist-specific bookings",
        body: "Clients book the artist, not just a slot. Glamify filters availability by artist preference.",
      },
      {
        title: "Aftercare follow-ups",
        body: "Auto-send aftercare instructions and check-in reminders 3, 7, and 14 days post-session.",
      },
    ],
    features: ["pos-billing", "consumer-app", "crm", "marketing", "loyalty"],
  },
};

export function getSolutionSlugs(): string[] {
  return Object.keys(solutions);
}

export function getSolution(slug: string): Solution | undefined {
  return solutions[slug];
}
