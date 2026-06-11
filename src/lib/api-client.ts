import { getFreshToken } from "@/lib/session";

const BASE = "/api/v1";

class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // Always pull a fresh Supabase access token (they expire ~1h).
  const token = typeof window !== "undefined" ? await getFreshToken() : null;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const json = await res.json();
  if (!json.success) throw new ApiError(res.status, json.error?.code ?? "UNKNOWN", json.error?.message ?? "Request failed");
  return json.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  tenantId: string;
  tenant?: { id: string; name: string; plan: string; businessType: string };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardKpis {
  todayAppointments: number;
  monthRevenue: number;
  revenueChangePct: number;
  monthBookings: number;
  totalClients: number;
  newClientsThisMonth: number;
  lowStockAlerts: number;
  revenueGoal: number | null;
}

export interface UpcomingAppointment {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  client: { id: string; fullName: string; phone: string | null };
  staff: { user: { id: string; fullName: string; avatarUrl: string | null } } | null;
  items: { service: { name: string; durationMinutes: number } }[];
}

export interface DashboardData {
  kpis: DashboardKpis;
  upcomingToday: UpcomingAppointment[];
}

export const dashboardApi = {
  get: (locationId?: string) =>
    api.get<DashboardData>(`/dashboard${locationId ? `?locationId=${locationId}` : ""}`),
  charts: () => api.get<DashboardCharts>("/dashboard/charts"),
};

export interface OnboardingProgress {
  storefrontUrl: string | null;
  isPublished: boolean;
  steps: {
    account: boolean;
    profile: boolean;
    services: boolean;
    photos: boolean;
    published: boolean;
    booking: boolean;
  };
}

export const onboardingApi = {
  progress: () => api.get<OnboardingProgress>("/onboarding/progress"),
};

// ─── Settings ───────────────────────────────────────────────────────────────

export interface SettingsData {
  profile: {
    name: string;
    legalName: string;
    phone: string;
    email: string;
    about: string;
    openHour: number | null;
    closeHour: number | null;
    businessType: string;
    revenueGoal: number | null;
  };
  tax: {
    gstEnabled: boolean;
    gstin: string;
    hsnServices: string;
    hsnRetail: string;
    defaultGstPct: number | null;
    invoicePrefix: string;
    showInclusive: boolean;
  };
  integrations: Record<string, boolean>;
  gbp: { url: string; connectedAt: string } | null;
  profileComplete: boolean;
}

export const settingsApi = {
  get: () => api.get<SettingsData>("/settings"),
  update: (body: Record<string, unknown>) => api.patch<{ saved: boolean }>("/settings", body),
};

// ─── Locations / branches ─────────────────────────────────────────────────────

export interface BranchLocation {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  pincode: string | null;
  phone: string | null;
  isActive: boolean;
  staffCount: number;
}

export const locationsApi = {
  list: () => api.get<{ locations: BranchLocation[] }>("/locations"),
  create: (body: { name: string; address?: string; city?: string; pincode?: string; phone?: string }) =>
    api.post<{ location: BranchLocation }>("/locations", body),
  update: (id: string, body: Partial<BranchLocation>) => api.patch<{ updated: boolean }>(`/locations/${id}`, body),
  remove: (id: string) => api.delete<{ deleted: boolean }>(`/locations/${id}`),
};

export interface DashboardCharts {
  revenueTrends: { day: string; revenue: number }[];
  serviceMix: { name: string; value: number; color: string }[];
  bookingsThisWeek: { day: string; today: number; yesterday: number }[];
  hasRevenue: boolean;
  hasServiceMix: boolean;
  hasBookings: boolean;
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export interface ClientSummary {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  gender?: string | null;
  dob?: string | null;
  notes?: string | null;
  tags: string[];
  loyaltyPoints: number;
  totalVisits: number;
  totalSpend: number;
  lastVisitAt: string | null;
  createdAt: string;
}

export interface ClientsResponse {
  clients: ClientSummary[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface ClientVisit {
  id: string; startsAt: string; status: string;
  items: { service: { name: string } }[];
}
export interface LoyaltyTxn {
  id: string; type: string; points: number; note: string | null; createdAt: string;
}
export interface ClientInvoice {
  id: string; invoiceNumber: string; status: string; totalAmt: number;
  paymentMethod: string; createdAt: string;
}
export interface ClientDetail extends ClientSummary {
  appointments: ClientVisit[];
  invoices: ClientInvoice[];
  loyaltyTxns: LoyaltyTxn[];
}

export const clientsApi = {
  list: (params?: { q?: string; tag?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.tag) qs.set("tag", params.tag);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    return api.get<ClientsResponse>(`/clients?${qs}`);
  },
  get: (id: string) => api.get<ClientSummary>(`/clients/${id}`),
  getDetail: (id: string) => api.get<ClientDetail>(`/clients/${id}`),
  create: (body: Partial<ClientSummary> & { fullName: string }) => api.post<ClientSummary>("/clients", body),
  update: (id: string, body: Partial<ClientSummary>) => api.patch<ClientSummary>(`/clients/${id}`, body),
  import: (rows: ImportClientRow[]) =>
    api.post<ImportClientResult>("/clients/import", { rows }),
};

export interface ImportClientRow {
  fullName: string;
  phone?: string;
  email?: string;
  gender?: string;
  notes?: string;
  tags?: string[];
}

export interface ImportClientResult {
  created: number;
  updated: number;
  skipped: number;
  total: number;
  errors: string[];
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  source: "appointment" | "online";
  startsAt: string;
  endsAt: string;
  status: string;
  title: string;
  subtitle: string;
  staffName: string | null;
}

export interface OpeningHours {
  [day: string]: { open: string; close: string; closed?: boolean };
}

export const calendarApi = {
  range: (fromISO: string, toISO: string) =>
    api.get<{ events: CalendarEvent[]; openingHours: OpeningHours | null }>(
      `/calendar?from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`
    ),
};

export const appointmentsApi = {
  list: (params?: { locationId?: string; from?: string; to?: string; staffId?: string; status?: string }) => {
    const qs = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([k, v]) => v && qs.set(k, v));
    return api.get<{ appointments: UpcomingAppointment[] }>(`/appointments?${qs}`);
  },
  get: (id: string) => api.get<UpcomingAppointment>(`/appointments/${id}`),
  create: (body: { locationId: string; clientId: string; staffId?: string; startsAt: string; serviceIds: string[]; notes?: string }) =>
    api.post<UpcomingAppointment>("/appointments", body),
  updateStatus: (id: string, status: string) => api.patch<UpcomingAppointment>(`/appointments/${id}`, { status }),
};

// ─── Services ─────────────────────────────────────────────────────────────────

export interface Service {
  id: string;
  name: string;
  categoryId: string | null;
  durationMinutes: number;
  price: number;
  priceType?: "fixed" | "from" | "range" | null;
  priceMax?: number | null;
  taxPct: number;
  isActive: boolean;
  category?: { id: string; name: string } | null;
}

export const servicesApi = {
  list: () => api.get<{ services: Service[] }>("/services"),
};

// ─── Staff ────────────────────────────────────────────────────────────────────

export interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  role: string;
  staffDetail: { locationId: string; speciality: string | null; commissionPct: number; isBookable: boolean } | null;
}

export interface StaffInput {
  fullName: string;
  email: string;
  phone?: string;
  role?: "owner" | "manager" | "staff" | "receptionist";
  password?: string;
  locationId: string;
  speciality?: string;
  commissionPct?: number;
  isBookable?: boolean;
}

export const staffApi = {
  list: (locationId?: string) =>
    api.get<{ staff: StaffMember[] }>(`/staff${locationId ? `?locationId=${locationId}` : ""}`),
  create: (body: StaffInput) => api.post<StaffMember>("/staff", body),
};

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  unit: string;
  stockQty: number;
  reorderLevel: number;
  isLowStock: boolean;
  costPrice: number;
  sellPrice: number;
}

export interface ProductInput {
  name: string;
  sku?: string;
  category?: string;
  unit?: string;
  costPrice?: number;
  sellPrice?: number;
  stockQty?: number;
  reorderLevel?: number;
  supplier?: string;
}

export interface ReportsData {
  kpis: { revenue: number; bookings: number; avgTicket: number; totalClients: number };
  revenueTrend: { date: string; revenue: number }[];
  serviceMix: { name: string; revenue: number }[];
  paymentMix: { name: string; value: number }[];
  clientMix: { name: string; value: number }[];
  hasData: boolean;
}

export const reportsApi = {
  get: (range: string) => api.get<ReportsData>(`/reports?range=${range}`),
};

export interface Campaign {
  id: string;
  name: string;
  channel: "push" | "sms" | "email" | "whatsapp";
  status: "draft" | "scheduled" | "sending" | "sent" | "failed" | "cancelled";
  segment: { id: string; label: string };
  body: string;
  recipientCount: number;
  openCount: number;
  sentAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
}

export const campaignsApi = {
  list: () => api.get<{ campaigns: Campaign[] }>("/campaigns"),
  create: (body: {
    name: string;
    channel: string;
    segmentId: string;
    segmentLabel: string;
    body: string;
    scheduleMode: "now" | "later";
    scheduleAt?: string;
    recipientIds: string[];
  }) => api.post<{ campaign: Campaign }>("/campaigns", body),
};

export const inventoryApi = {
  list: (params?: { q?: string; category?: string; lowStock?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.category) qs.set("category", params.category);
    if (params?.lowStock) qs.set("lowStock", "true");
    return api.get<{ products: Product[] }>(`/inventory?${qs}`);
  },
  create: (body: ProductInput) => api.post<Product>("/inventory", body),
  adjust: (id: string, body: { locationId: string; type: "purchase" | "adjustment" | "waste"; qty: number; note?: string }) =>
    api.post<unknown>(`/inventory/${id}`, body),
};
