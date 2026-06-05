// Storefront content types + static seed data for pilot salons.
// In production these come from the NestJS API via ISR; this file
// provides compile-time types and a local fallback for dev/demo.

export type ServiceCategory = {
  id: string;
  name: string;
};

export type Service = {
  id: string;
  categoryId: string;
  name: string;
  durationMins: number;
  price: number; // INR — the "from" / base price
  priceType?: "fixed" | "from" | "range";
  priceMax?: number; // upper bound when priceType = "range"
  description?: string;
};

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  photo?: string;
  speciality?: string;
};

export type Review = {
  id: string;
  authorName: string;
  rating: number; // 1–5
  text: string;
  date: string; // ISO date
  verified: boolean;
};

export type DayHours = {
  open: string; // "10:00"
  close: string; // "20:00"
  closed?: boolean;
};

export type WeeklyHours = {
  mon: DayHours;
  tue: DayHours;
  wed: DayHours;
  thu: DayHours;
  fri: DayHours;
  sat: DayHours;
  sun: DayHours;
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  type: "flat" | "percentage" | "milestone";
  value?: number;
  validTo?: string; // ISO date
};

export type LoyaltyProgram = {
  pointsPerRupee: number;
  redeemRate: number; // points per ₹1
  description: string;
};

export type Storefront = {
  tenantId?: string; // undefined for seed-data storefronts; set for DB-backed ones
  slug: string;
  city: string;
  area: string;
  name: string;
  tagline: string;
  description: string;
  phone: string;
  address: string;
  geoLat: number;
  geoLng: number;
  rating: number;
  reviewCount: number;
  photos: string[]; // URLs
  businessType: string;
  priceRange: "₹" | "₹₹" | "₹₹₹";
  hours: WeeklyHours;
  serviceCategories: ServiceCategory[];
  services: Service[];
  team: StaffMember[];
  offers: Offer[];
  loyalty?: LoyaltyProgram;
  reviews: Review[];
  isOpen?: boolean; // computed at runtime
};

// ─── Seed data ──────────────────────────────────────────────────────────────

const DEFAULT_HOURS: WeeklyHours = {
  mon: { open: "10:00", close: "20:00" },
  tue: { open: "10:00", close: "20:00" },
  wed: { open: "10:00", close: "20:00" },
  thu: { open: "10:00", close: "20:00" },
  fri: { open: "10:00", close: "21:00" },
  sat: { open: "09:00", close: "21:00" },
  sun: { open: "10:00", close: "18:00" },
};

export const STOREFRONT_SEED: Storefront[] = [
  {
    slug: "priya-beauty-salon",
    city: "mumbai",
    area: "bandra-west",
    name: "Priya Beauty Salon",
    tagline: "Your neighbourhood beauty destination in Bandra West",
    description:
      "Priya Beauty Salon has been Bandra's trusted beauty destination for over 12 years. Specialising in hair colour, bridal makeup, and skin treatments.",
    phone: "+91-98765-43210",
    address: "Shop 4, Linking Road, Bandra West, Mumbai 400050",
    geoLat: 19.0596,
    geoLng: 72.8295,
    rating: 4.7,
    reviewCount: 148,
    businessType: "Beauty Salon",
    priceRange: "₹₹",
    photos: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80",
    ],
    hours: DEFAULT_HOURS,
    serviceCategories: [
      { id: "hair", name: "Hair" },
      { id: "skin", name: "Skin & Face" },
      { id: "makeup", name: "Makeup" },
      { id: "nails", name: "Nails" },
    ],
    services: [
      { id: "s1", categoryId: "hair", name: "Haircut + Blowdry", durationMins: 60, price: 799 },
      { id: "s2", categoryId: "hair", name: "Hair Colour (Global)", durationMins: 120, price: 2499 },
      { id: "s3", categoryId: "hair", name: "Hair Spa", durationMins: 90, price: 1299, description: "Deep conditioning + scalp massage" },
      { id: "s4", categoryId: "hair", name: "Keratin Treatment", durationMins: 180, price: 4999 },
      { id: "s5", categoryId: "skin", name: "Cleanup (Basic)", durationMins: 45, price: 599 },
      { id: "s6", categoryId: "skin", name: "D-Tan Pack", durationMins: 60, price: 799 },
      { id: "s7", categoryId: "skin", name: "Hydrafacial", durationMins: 75, price: 2999 },
      { id: "s8", categoryId: "makeup", name: "Party Makeup", durationMins: 90, price: 1999 },
      { id: "s9", categoryId: "makeup", name: "Bridal Makeup", durationMins: 180, price: 12999 },
      { id: "s10", categoryId: "nails", name: "Manicure + Pedicure", durationMins: 75, price: 899 },
      { id: "s11", categoryId: "nails", name: "Gel Nails", durationMins: 60, price: 1499 },
    ],
    team: [
      { id: "t1", name: "Priya Sharma", role: "Founder & Senior Stylist", speciality: "Hair Colour & Bridal" },
      { id: "t2", name: "Neha Joshi", role: "Skin Therapist", speciality: "Facials & Skincare" },
      { id: "t3", name: "Rahul Verma", role: "Hair Stylist", speciality: "Cuts & Keratin" },
    ],
    offers: [
      {
        id: "o1",
        title: "New Customer Offer",
        description: "Get 20% off on your first visit",
        type: "percentage",
        value: 20,
      },
      {
        id: "o2",
        title: "Weekend Hair Spa",
        description: "Hair Spa at ₹999 (was ₹1,299) every Saturday & Sunday",
        type: "flat",
        value: 300,
        validTo: "2026-07-31",
      },
    ],
    loyalty: {
      pointsPerRupee: 1,
      redeemRate: 100,
      description: "Earn 1 point per ₹1 spent. Redeem 100 points for ₹1 off.",
    },
    reviews: [
      {
        id: "r1",
        authorName: "Ananya M.",
        rating: 5,
        text: "Best hair salon in Bandra! Priya did my hair colour and it looks absolutely stunning. The place is very clean and staff is so friendly.",
        date: "2026-05-22",
        verified: true,
      },
      {
        id: "r2",
        authorName: "Kavya R.",
        rating: 5,
        text: "Came for bridal makeup trial and was blown away. Neha is incredible at her work. Booking through the link was super easy too.",
        date: "2026-05-18",
        verified: true,
      },
      {
        id: "r3",
        authorName: "Shreya T.",
        rating: 4,
        text: "Good hydrafacial. Skin felt amazing after. Will come back for the hair spa next time.",
        date: "2026-05-10",
        verified: true,
      },
      {
        id: "r4",
        authorName: "Pooja K.",
        rating: 5,
        text: "Rahul gave me the best haircut I've had in years. Exactly what I described. Very hygienic salon.",
        date: "2026-04-30",
        verified: true,
      },
    ],
  },
];

export function getStorefrontBySlug(city: string, slug: string): Storefront | null {
  return (
    STOREFRONT_SEED.find((s) => s.city === city && s.slug === slug) ?? null
  );
}

export function getAllStorefrontSlugs(): { city: string; slug: string }[] {
  return STOREFRONT_SEED.map((s) => ({ city: s.city, slug: s.slug }));
}

export function isOpenNow(hours: WeeklyHours): boolean {
  const now = new Date();
  const days: (keyof WeeklyHours)[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const dayKey = days[now.getDay()];
  const dayHours = hours[dayKey];
  if (dayHours.closed) return false;
  const [oh, om] = dayHours.open.split(":").map(Number);
  const [ch, cm] = dayHours.close.split(":").map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= oh * 60 + om && nowMins < ch * 60 + cm;
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

// Price label that respects the service's price type (fixed / from / range).
export function formatServicePrice(svc: Pick<Service, "price" | "priceType" | "priceMax">): string {
  if (svc.priceType === "from") return `${formatPrice(svc.price)}+`;
  if (svc.priceType === "range" && svc.priceMax != null) {
    return `${formatPrice(svc.price)} – ${formatPrice(svc.priceMax)}`;
  }
  return formatPrice(svc.price);
}

export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
