const BASE = "/api/v1";

class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("glm_token") : null;
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

export function storeToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem("glm_token", token);
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem("glm_token");
}

export function getToken() {
  if (typeof window !== "undefined") return localStorage.getItem("glm_token");
  return null;
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
};

// ─── Clients ──────────────────────────────────────────────────────────────────

export interface ClientSummary {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
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
  create: (body: Partial<ClientSummary> & { fullName: string }) => api.post<ClientSummary>("/clients", body),
  update: (id: string, body: Partial<ClientSummary>) => api.patch<ClientSummary>(`/clients/${id}`, body),
};

// ─── Appointments ─────────────────────────────────────────────────────────────

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

export const staffApi = {
  list: (locationId?: string) =>
    api.get<{ staff: StaffMember[] }>(`/staff${locationId ? `?locationId=${locationId}` : ""}`),
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
}

export const inventoryApi = {
  list: (params?: { q?: string; category?: string; lowStock?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.category) qs.set("category", params.category);
    if (params?.lowStock) qs.set("lowStock", "true");
    return api.get<{ products: Product[] }>(`/inventory?${qs}`);
  },
};
