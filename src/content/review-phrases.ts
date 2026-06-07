// Curated review-phrase library for the storefront review flow.
// Customers tap a suggested phrase (or edit it) instead of typing from scratch.
// Multiple varied options per star so reviews never look copy-pasted / fake.
// `{salon}` is replaced with the salon name at render time.

export const REVIEW_PHRASES: Record<number, string[]> = {
  5: [
    "Absolutely loved my visit to {salon}! The staff were warm and the result was perfect.",
    "Best salon experience I've had in a while. Highly recommend {salon}.",
    "Super professional team and spotless place. Will definitely come back to {salon}.",
    "{salon} exceeded my expectations — friendly staff and great attention to detail.",
    "Fantastic service and a relaxing vibe. 10/10 for {salon}.",
    "Walked out feeling amazing. The team at {salon} really knows their craft.",
    "Clean, on-time, and the result was exactly what I wanted. Love this place!",
    "Genuinely impressed with the quality and care. {salon} is my new go-to.",
    "Lovely experience from start to finish. The staff made me feel so comfortable.",
    "Great value and brilliant service. Couldn't be happier with {salon}.",
  ],
  4: [
    "Really good experience at {salon} — happy with the result, will visit again.",
    "Friendly staff and nice ambience. A couple of small things but overall great.",
    "Good service and reasonable prices. Recommend {salon}.",
    "Enjoyed my visit. The team was professional and the place was clean.",
    "Solid experience overall — happy with how it turned out.",
    "Nice salon, polite staff, decent wait time. Would come back.",
    "Pretty happy with my service at {salon}. Good job by the team.",
  ],
  3: [
    "Decent experience at {salon}. A few things could be better.",
    "It was okay — service was fine but nothing stood out.",
    "Average visit. The result was fine but the wait was a bit long.",
    "Reasonable service. Room for improvement but not bad.",
    "Mixed experience — some good, some areas to work on.",
  ],
  2: [
    "Service didn't quite meet my expectations this time.",
    "A few issues with my visit — hoping it improves.",
    "Not my best experience at {salon}. The result was below average.",
    "Disappointed with a few things. Staff were polite though.",
  ],
  1: [
    "Unfortunately my visit didn't go well.",
    "Not happy with the service or the result.",
    "Several problems during my visit — needs improvement.",
    "Poor experience this time, would not recommend as is.",
  ],
};

// Pick N varied phrases for a star rating, salon name interpolated.
export function suggestionsForStar(star: number, salon: string, count = 4): string[] {
  const pool = REVIEW_PHRASES[star] ?? [];
  // Shuffle a copy so the suggestions differ each time the page loads.
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((p) => p.replace(/\{salon\}/g, salon));
}

// Star >= this routes the customer to Google (happy-customer funnel).
export const GOOGLE_FUNNEL_MIN_STARS = 4;
