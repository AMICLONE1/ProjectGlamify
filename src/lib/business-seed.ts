export type ClientTag = "vip" | "new" | "at-risk" | "regular" | "birthday";

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  initials: string;
  tags: ClientTag[];
  notes: string;
  allergies: string[];
  totalVisits: number;
  totalSpend: number;
  avgTicket: number;
  lastVisit: string;
  preferredStylist: string;
  segment: "VIP" | "Regular" | "New" | "At-risk";
  loyaltyPoints: number;
};

export const clients: Client[] = [
  {
    id: "c-001",
    name: "Ananya Sharma",
    phone: "+91 98765 43210",
    email: "ananya.s@gmail.com",
    initials: "AS",
    tags: ["vip", "regular"],
    notes: "Prefers cooler tones. Avoid heavy fragrances.",
    allergies: ["PPD (hair dye)"],
    totalVisits: 24,
    totalSpend: 38400,
    avgTicket: 1600,
    lastVisit: "21 days ago",
    preferredStylist: "Priya",
    segment: "VIP",
    loyaltyPoints: 2840,
  },
  {
    id: "c-002",
    name: "Karan Mehta",
    phone: "+91 99876 54321",
    email: "karan.mehta@outlook.com",
    initials: "KM",
    tags: ["regular"],
    notes: "Quick visits. Likes the 9 AM slot.",
    allergies: [],
    totalVisits: 12,
    totalSpend: 7200,
    avgTicket: 600,
    lastVisit: "10 days ago",
    preferredStylist: "Rohan",
    segment: "Regular",
    loyaltyPoints: 720,
  },
  {
    id: "c-003",
    name: "Meera Joshi",
    phone: "+91 97654 12345",
    email: "meera.j@yahoo.com",
    initials: "MJ",
    tags: ["vip", "birthday"],
    notes: "Birthday in two weeks. Send a complimentary upgrade.",
    allergies: ["Salicylic acid"],
    totalVisits: 31,
    totalSpend: 52600,
    avgTicket: 1700,
    lastVisit: "14 days ago",
    preferredStylist: "Sneha",
    segment: "VIP",
    loyaltyPoints: 5260,
  },
  {
    id: "c-004",
    name: "Riya Kapoor",
    phone: "+91 90123 45678",
    email: "riya.kapoor@gmail.com",
    initials: "RK",
    tags: ["new"],
    notes: "New client — referred by Ananya. Sensitive scalp.",
    allergies: ["Ammonia"],
    totalVisits: 1,
    totalSpend: 3200,
    avgTicket: 3200,
    lastVisit: "3 days ago",
    preferredStylist: "Priya",
    segment: "New",
    loyaltyPoints: 320,
  },
  {
    id: "c-005",
    name: "Sara Khan",
    phone: "+91 93456 78901",
    email: "sara.k@gmail.com",
    initials: "SK",
    tags: ["at-risk"],
    notes: "Used to visit every 28 days. Lapsed.",
    allergies: [],
    totalVisits: 14,
    totalSpend: 21000,
    avgTicket: 1500,
    lastVisit: "62 days ago",
    preferredStylist: "Sneha",
    segment: "At-risk",
    loyaltyPoints: 2100,
  },
  {
    id: "c-006",
    name: "Vikram Singh",
    phone: "+91 98123 67890",
    email: "vikram.s@gmail.com",
    initials: "VS",
    tags: ["regular"],
    notes: "Beard trim regular. Walks in on Saturdays.",
    allergies: [],
    totalVisits: 18,
    totalSpend: 5400,
    avgTicket: 300,
    lastVisit: "7 days ago",
    preferredStylist: "Rohan",
    segment: "Regular",
    loyaltyPoints: 540,
  },
  {
    id: "c-007",
    name: "Deepika Iyer",
    phone: "+91 97890 12345",
    email: "deepika.i@gmail.com",
    initials: "DI",
    tags: ["vip", "birthday"],
    notes: "Birthday next month. Anniversary client.",
    allergies: [],
    totalVisits: 42,
    totalSpend: 84000,
    avgTicket: 2000,
    lastVisit: "8 days ago",
    preferredStylist: "Priya",
    segment: "VIP",
    loyaltyPoints: 8400,
  },
  {
    id: "c-008",
    name: "Aditi Verma",
    phone: "+91 99001 12345",
    email: "aditi.v@outlook.com",
    initials: "AV",
    tags: ["new"],
    notes: "First-time client. Wants to try keratin.",
    allergies: [],
    totalVisits: 1,
    totalSpend: 4200,
    avgTicket: 4200,
    lastVisit: "5 days ago",
    preferredStylist: "Priya",
    segment: "New",
    loyaltyPoints: 420,
  },
  {
    id: "c-009",
    name: "Neha Bhatia",
    phone: "+91 90876 54321",
    email: "neha.b@gmail.com",
    initials: "NB",
    tags: ["at-risk"],
    notes: "Hasn't visited since festive season.",
    allergies: [],
    totalVisits: 9,
    totalSpend: 11700,
    avgTicket: 1300,
    lastVisit: "71 days ago",
    preferredStylist: "Sneha",
    segment: "At-risk",
    loyaltyPoints: 1170,
  },
  {
    id: "c-010",
    name: "Tanvi Rao",
    phone: "+91 98456 78912",
    email: "tanvi.r@yahoo.com",
    initials: "TR",
    tags: ["regular"],
    notes: "Books mani+pedi monthly.",
    allergies: [],
    totalVisits: 16,
    totalSpend: 19200,
    avgTicket: 1200,
    lastVisit: "12 days ago",
    preferredStylist: "Deepa",
    segment: "Regular",
    loyaltyPoints: 1920,
  },
];

export type Service = {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  taxRate: number;
};

export const services: Service[] = [
  { id: "s-01", name: "Hair cut", category: "Hair", durationMinutes: 30, price: 800, taxRate: 18 },
  { id: "s-02", name: "Blow dry", category: "Hair", durationMinutes: 30, price: 400, taxRate: 18 },
  { id: "s-03", name: "Keratin treatment", category: "Hair", durationMinutes: 120, price: 4200, taxRate: 18 },
  { id: "s-04", name: "Hydra facial", category: "Skin", durationMinutes: 60, price: 1800, taxRate: 18 },
  { id: "s-05", name: "Classic facial", category: "Skin", durationMinutes: 45, price: 1100, taxRate: 18 },
  { id: "s-06", name: "Manicure", category: "Nails", durationMinutes: 30, price: 500, taxRate: 18 },
  { id: "s-07", name: "Pedicure", category: "Nails", durationMinutes: 45, price: 700, taxRate: 18 },
  { id: "s-08", name: "Hair color (root touch-up)", category: "Hair", durationMinutes: 60, price: 1500, taxRate: 18 },
  { id: "s-09", name: "Hair gloss", category: "Hair", durationMinutes: 30, price: 600, taxRate: 18 },
  { id: "s-10", name: "Beard trim", category: "Grooming", durationMinutes: 20, price: 300, taxRate: 18 },
  { id: "s-11", name: "Head massage", category: "Wellness", durationMinutes: 30, price: 700, taxRate: 18 },
  { id: "s-12", name: "Waxing (full leg)", category: "Body", durationMinutes: 30, price: 900, taxRate: 18 },
];

export type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  retailPrice: number;
  taxRate: number;
};

export const products: Product[] = [
  { id: "p-01", sku: "OL-SH-250", name: "Olaplex No.4 Bond Maintenance Shampoo 250ml", brand: "Olaplex", category: "Aftercare", retailPrice: 2400, taxRate: 18 },
  { id: "p-02", sku: "OL-CN-250", name: "Olaplex No.5 Conditioner 250ml", brand: "Olaplex", category: "Aftercare", retailPrice: 2400, taxRate: 18 },
  { id: "p-03", sku: "LR-SR-50", name: "L'Oréal Pro Serie Expert Serum 50ml", brand: "L'Oréal", category: "Aftercare", retailPrice: 1100, taxRate: 18 },
  { id: "p-04", sku: "MK-FW-150", name: "Mamaearth Vitamin C Face Wash 150ml", brand: "Mamaearth", category: "Skincare", retailPrice: 250, taxRate: 18 },
  { id: "p-05", sku: "GLM-GFT-1000", name: "Clitell Gift Card · ₹1000", brand: "Clitell", category: "Gift card", retailPrice: 1000, taxRate: 0 },
];

export type Staff = {
  id: string;
  name: string;
  initials: string;
  role: "stylist" | "receptionist" | "manager" | "owner";
  skills: string[];
  todayHours: string;
  utilization: number;
};

export const staff: Staff[] = [
  { id: "u-001", name: "Priya M.", initials: "PM", role: "stylist", skills: ["Hair", "Color", "Keratin"], todayHours: "9:00 – 19:00", utilization: 92 },
  { id: "u-002", name: "Rohan S.", initials: "RS", role: "stylist", skills: ["Grooming", "Hair", "Beard"], todayHours: "10:00 – 19:00", utilization: 76 },
  { id: "u-003", name: "Sneha I.", initials: "SI", role: "stylist", skills: ["Skin", "Facial", "Threading"], todayHours: "11:00 – 20:00", utilization: 84 },
  { id: "u-004", name: "Deepa R.", initials: "DR", role: "stylist", skills: ["Nails", "Mani", "Pedi"], todayHours: "10:00 – 19:00", utilization: 65 },
];

export type Appointment = {
  id: string;
  staffId: string;
  clientId: string | null;
  clientLabel: string;
  serviceIds: string[];
  serviceLabel: string;
  startMinutes: number;
  endMinutes: number;
  status: "in-progress" | "confirmed" | "queued" | "completed" | "no-show";
  notes?: string;
};

export const todayAppointments: Appointment[] = [
  { id: "a-01", staffId: "u-001", clientId: "c-001", clientLabel: "Ananya S.", serviceIds: ["s-01", "s-02"], serviceLabel: "Hair cut + blow dry", startMinutes: 9 * 60, endMinutes: 10 * 60, status: "in-progress", notes: "PPD allergy — use ammonia-free color" },
  { id: "a-02", staffId: "u-002", clientId: "c-002", clientLabel: "Karan M.", serviceIds: ["s-10"], serviceLabel: "Beard trim", startMinutes: 9 * 60 + 30, endMinutes: 9 * 60 + 50, status: "confirmed" },
  { id: "a-03", staffId: "u-003", clientId: "c-003", clientLabel: "Meera J.", serviceIds: ["s-04"], serviceLabel: "Hydra facial", startMinutes: 10 * 60, endMinutes: 11 * 60, status: "confirmed" },
  { id: "a-04", staffId: "u-004", clientId: null, clientLabel: "Walk-in · 1", serviceIds: ["s-06", "s-07"], serviceLabel: "Mani + Pedi", startMinutes: 10 * 60 + 30, endMinutes: 11 * 60 + 45, status: "queued" },
  { id: "a-05", staffId: "u-001", clientId: "c-004", clientLabel: "Riya K.", serviceIds: ["s-03"], serviceLabel: "Keratin treatment", startMinutes: 11 * 60, endMinutes: 13 * 60, status: "confirmed" },
  { id: "a-06", staffId: "u-002", clientId: "c-006", clientLabel: "Vikram S.", serviceIds: ["s-01"], serviceLabel: "Hair cut", startMinutes: 11 * 60, endMinutes: 11 * 60 + 30, status: "confirmed" },
  { id: "a-07", staffId: "u-003", clientId: "c-007", clientLabel: "Deepika I.", serviceIds: ["s-05"], serviceLabel: "Classic facial", startMinutes: 12 * 60, endMinutes: 12 * 60 + 45, status: "confirmed" },
  { id: "a-08", staffId: "u-004", clientId: "c-010", clientLabel: "Tanvi R.", serviceIds: ["s-06"], serviceLabel: "Manicure", startMinutes: 12 * 60 + 30, endMinutes: 13 * 60, status: "confirmed" },
  { id: "a-09", staffId: "u-001", clientId: "c-008", clientLabel: "Aditi V.", serviceIds: ["s-09"], serviceLabel: "Hair gloss", startMinutes: 14 * 60, endMinutes: 14 * 60 + 30, status: "confirmed" },
  { id: "a-10", staffId: "u-003", clientId: null, clientLabel: "Walk-in · 2", serviceIds: ["s-11"], serviceLabel: "Head massage", startMinutes: 15 * 60, endMinutes: 15 * 60 + 30, status: "queued" },
  { id: "a-11", staffId: "u-002", clientId: "c-006", clientLabel: "Vikram S.", serviceIds: ["s-10"], serviceLabel: "Beard touch-up", startMinutes: 16 * 60, endMinutes: 16 * 60 + 20, status: "confirmed" },
  { id: "a-12", staffId: "u-001", clientId: "c-003", clientLabel: "Meera J.", serviceIds: ["s-08"], serviceLabel: "Root touch-up", startMinutes: 17 * 60, endMinutes: 18 * 60, status: "confirmed" },
];

export type WalkInEntry = {
  id: string;
  position: number;
  clientLabel: string;
  service: string;
  estimatedWaitMinutes: number;
  joinedAt: string;
};

export const walkInQueue: WalkInEntry[] = [
  { id: "w-01", position: 1, clientLabel: "Sara K.", service: "Hair gloss", estimatedWaitMinutes: 15, joinedAt: "10:42 AM" },
  { id: "w-02", position: 2, clientLabel: "Walk-in · 3", service: "Beard trim", estimatedWaitMinutes: 25, joinedAt: "10:58 AM" },
  { id: "w-03", position: 3, clientLabel: "Aditi V.", service: "Manicure", estimatedWaitMinutes: 40, joinedAt: "11:10 AM" },
];

export type RevenueDay = { day: string; revenue: number; bookings: number };

export const revenueLast14Days: RevenueDay[] = [
  { day: "May 15", revenue: 32400, bookings: 29 },
  { day: "May 16", revenue: 38900, bookings: 34 },
  { day: "May 17", revenue: 41200, bookings: 36 },
  { day: "May 18", revenue: 28600, bookings: 25 },
  { day: "May 19", revenue: 25100, bookings: 21 },
  { day: "May 20", revenue: 35400, bookings: 31 },
  { day: "May 21", revenue: 42800, bookings: 38 },
  { day: "May 22", revenue: 39500, bookings: 35 },
  { day: "May 23", revenue: 31200, bookings: 28 },
  { day: "May 24", revenue: 36800, bookings: 32 },
  { day: "May 25", revenue: 44100, bookings: 39 },
  { day: "May 26", revenue: 27300, bookings: 24 },
  { day: "May 27", revenue: 33900, bookings: 30 },
  { day: "May 28", revenue: 42800, bookings: 38 },
];

export function findClient(id: string | null): Client | undefined {
  if (!id) return undefined;
  return clients.find((c) => c.id === id);
}

export function findStaff(id: string): Staff | undefined {
  return staff.find((s) => s.id === id);
}

export function findService(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

export function findProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hour12 = ((h + 11) % 12) + 1;
  const ampm = h < 12 ? "AM" : "PM";
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
