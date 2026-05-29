export type BlogHighlight = {
  label: string;
  value: string;
};

export type BlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  quote?: string;
};

export type BlogPost = {
  slug: string;
  category: string;
  title: string;
  hero: string;
  excerpt: string;
  description: string;
  publishedAt: string;
  publishedLabel: string;
  readingTime: string;
  author: string;
  authorRole: string;
  highlights: BlogHighlight[];
  takeaways: string[];
  sections: BlogSection[];
  related: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "cut-no-shows-without-discounting",
    category: "Operations",
    title: "How salons can cut no-shows without discounting",
    hero: "Keep the slot. Protect the margin.",
    excerpt:
      "The easiest fix for empty chairs is not a discount. It is a better confirmation loop, tighter waitlists, and smarter timing.",
    description:
      "No-shows are not just a booking problem. They are a revenue leak, a staffing problem, and often a reminder problem. The good news is you can reduce them without cutting prices.",
    publishedAt: "2026-05-29",
    publishedLabel: "May 29, 2026",
    readingTime: "6 min read",
    author: "Glamify Editorial",
    authorRole: "Operations",
    highlights: [
      { label: "Typical result", value: "20-40% fewer no-shows" },
      { label: "Focus", value: "Confirmation + waitlists" },
      { label: "Best for", value: "Busy salons" },
    ],
    takeaways: [
      "Confirm appointments at the right time, not just more often.",
      "Use waitlists to refill slots before you panic-discount.",
      "Measure no-shows by stylist, service, and day of week.",
    ],
    sections: [
      {
        heading: "Why discounting is the wrong first move",
        paragraphs: [
          "A discount can make an empty slot feel less painful, but it also normalises lower margins. If the underlying issue is missed reminders, weak rescheduling, or poor appointment timing, a cheaper price will not fix it.",
          "The better goal is simple: make the original booking more likely to happen and make the slot easy to recover when it does not.",
        ],
        quote: "You do not need a cheaper chair. You need fewer empty chairs.",
      },
      {
        heading: "Build a confirmation stack",
        paragraphs: [
          "The most effective salons use a layered flow. A first reminder gives the client time to reschedule. A second reminder catches people who meant to reply later. And if the client is high-risk or the slot is premium, a small deposit can be better than a large discount.",
        ],
        bullets: [
          "Send the first reminder around 24 hours before the appointment.",
          "Follow up with a short confirmation near the slot window.",
          "Offer one-tap rescheduling instead of forcing a cancellation.",
          "Let the waitlist auto-fill the slot as soon as it opens.",
        ],
      },
      {
        heading: "Measure the pattern, not the panic",
        paragraphs: [
          "No-show rates often cluster by stylist, weekday, and service type. The front desk can only act on the patterns it can see. Once those patterns are visible, you can adjust reminder timing, deposit rules, and waitlist logic without guessing.",
          "That is the difference between reacting to empty chairs and managing them.",
        ],
      },
    ],
    related: ["gst-billing-for-salons", "ai-scheduling-that-actually-helps-the-front-desk"],
  },
  {
    slug: "gst-billing-for-salons",
    category: "Finance",
    title: "GST billing for salons: what your receptionist should never do manually",
    hero: "Make the invoice boring.",
    excerpt:
      "Manual tax math slows the front desk down and creates audit risk. Here is the checklist every salon should automate.",
    description:
      "Billing should be fast, accurate, and repeatable. If your receptionist is calculating tax on a calculator or hunting for the right invoice template, your checkout flow is too fragile.",
    publishedAt: "2026-05-27",
    publishedLabel: "May 27, 2026",
    readingTime: "7 min read",
    author: "Glamify Editorial",
    authorRole: "Finance",
    highlights: [
      { label: "Goal", value: "Invoice in under 30 sec" },
      { label: "Risk", value: "Manual tax errors" },
      { label: "Best for", value: "High-volume front desks" },
    ],
    takeaways: [
      "Keep the service catalog tax-aware from the start.",
      "Make the checkout path fast enough for a busy receptionist.",
      "Keep a clear audit trail for every payment and adjustment.",
    ],
    sections: [
      {
        heading: "Make the service catalog tax-aware",
        paragraphs: [
          "Your service catalog should know the tax rate, invoice label, and pricing logic before the customer ever reaches checkout. That means the receptionist selects a service once and the system applies the right GST breakup automatically.",
          "If you wait until billing time to decide the tax, the front desk pays for it in speed and accuracy.",
        ],
        bullets: [
          "Store the tax rate with each service and product.",
          "Use consistent invoice labels and invoice numbering.",
          "Keep the line item list short and readable.",
        ],
      },
      {
        heading: "Set up a checkout flow a human can use fast",
        paragraphs: [
          "Billing at a salon is not a finance team workflow. It is a live service workflow. The receptionist needs a search-first client lookup, quick service selection, instant totals, and payment options that match the way customers actually pay in India.",
          "If a screen needs training to use, it is already too slow.",
        ],
        bullets: [
          "Support split payments across cash and UPI.",
          "Show the tax breakdown before payment is captured.",
          "Make refunds and credit notes easy to issue.",
          "Log every adjustment with a timestamp and user name.",
        ],
      },
      {
        heading: "What compliance should give you",
        paragraphs: [
          "Compliance is not just about avoiding problems. Good billing records give you better margin reporting, cleaner cash reconciliation, and fewer arguments at the end of the month. A clean system helps the owner and the accountant at the same time.",
          "The best checkout is the one nobody needs to think about after the transaction is done.",
        ],
      },
    ],
    related: ["cut-no-shows-without-discounting", "ai-scheduling-that-actually-helps-the-front-desk"],
  },
  {
    slug: "ai-scheduling-that-actually-helps-the-front-desk",
    category: "Intelligence",
    title: "AI scheduling that actually helps a busy front desk",
    hero: "No magic. Just better booking logic.",
    excerpt:
      "AI should suggest the next best slot, not add noise. Here is how to make scheduling genuinely useful in a real salon.",
    description:
      "The right scheduling system is not a chat toy. It should reduce decision fatigue, make underused slots visible, and protect the front desk from double-booking mistakes.",
    publishedAt: "2026-05-24",
    publishedLabel: "May 24, 2026",
    readingTime: "5 min read",
    author: "Glamify Product",
    authorRole: "Intelligence",
    highlights: [
      { label: "Outcome", value: "Smarter slot fills" },
      { label: "Focus", value: "Waitlists + risk scores" },
      { label: "Best for", value: "Growth stage teams" },
    ],
    takeaways: [
      "Use AI to surface the next best slot, not every possible slot.",
      "Let the system warn you about no-show risk before the booking lands.",
      "Keep a human in the loop for high-value appointments.",
    ],
    sections: [
      {
        heading: "What good scheduling AI actually does",
        paragraphs: [
          "Useful scheduling AI should reduce the number of decisions a receptionist has to make. It should suggest slots that fit the staff calendar, the service duration, and the client's habits without creating more work.",
          "If the front desk still has to mentally rebuild the schedule after every suggestion, the AI is not helping.",
        ],
      },
      {
        heading: "Make the model useful in the real world",
        paragraphs: [
          "In a salon, good recommendations depend on the operational context: staff availability, service duration, recurring appointments, and how likely a client is to show up. The strongest AI systems use those signals to guide the front desk instead of trying to replace it.",
        ],
        bullets: [
          "Surface underbooked slots first.",
          "Warn when a booking has a higher no-show risk.",
          "Offer waitlist clients the moment a slot opens.",
          "Block double-booking across staff and rooms.",
        ],
      },
      {
        heading: "Keep the human in the loop",
        paragraphs: [
          "The best AI leaves the final decision with the person who knows the business. That is especially true for premium services, VIP clients, and busy days where a small operational decision can change the whole afternoon.",
          "AI should give the receptionist leverage, not pressure.",
        ],
        quote: "The best AI does not talk the loudest. It removes the most friction.",
      },
    ],
    related: ["cut-no-shows-without-discounting", "gst-billing-for-salons"],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogPostSlugs(): string[] {
  return blogPosts.map((post) => post.slug);
}

export function getRelatedBlogPosts(slugs: string[]): BlogPost[] {
  return slugs
    .map((slug) => getBlogPostBySlug(slug))
    .filter((post): post is BlogPost => post !== undefined);
}