"use client";

import { getFreshToken } from "@/lib/session";

const BASE = "/api/v1/admin";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getFreshToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  // Tolerate empty / non-JSON bodies (e.g. a 204 or an upstream error page)
  // instead of crashing with "Unexpected end of JSON input".
  const text = await res.text();
  let json: { success?: boolean; data?: T; error?: { message?: string } } | null = null;
  if (text) {
    try { json = JSON.parse(text); } catch { /* non-JSON body */ }
  }

  if (json === null) {
    if (res.ok) return undefined as T; // succeeded with no body
    throw new Error(`Request failed (${res.status})`);
  }
  if (!res.ok || json.success === false) {
    throw new Error(json.error?.message ?? `Request failed (${res.status})`);
  }
  return json.data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminMetrics {
  tenants: { total: number; thisMonth: number; growthPct: number };
  users: { total: number; active: number };
  clients: { total: number };
  bookings: { total: number; last30: number };
  gmv: { total: number; thisMonth: number };
  leads: { pending: number };
  plans: { plan: string; count: number }[];
}

export interface TenantBilling {
  status?: "unpaid" | "paid" | "overdue";
  paidUntil?: string | null;
  amount?: number | null;
  method?: string | null;
  note?: string | null;
  updatedAt?: string;
}

export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  businessType: string;
  plan: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  suspended: boolean;
  billing: TenantBilling | null;
  counts: { users: number; clients: number; locations: number };
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  tenant: { id: string; name: string; slug: string };
}

export interface AdminLead {
  id: string;
  kind: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  businessName: string | null;
  businessType: string | null;
  city: string | null;
  message: string | null;
  topic: string | null;
  status: string;
  createdAt: string;
}

export interface ProvisionResult {
  tenantId: string;
  userId: string;
  email: string;
  password: string;
  plan: string;
  loginUrl: string;
  fullName: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const adminApi = {
  metrics: () => req<AdminMetrics>("/metrics"),

  tenants: (q?: string) => req<{ tenants: AdminTenant[] }>(`/tenants/list${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  setTenant: (id: string, body: { suspended?: boolean; plan?: string; billing?: TenantBilling }) =>
    req<{ tenant: { id: string; plan: string; suspended: boolean; billing: TenantBilling | null } }>(`/tenants/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteTenant: (id: string, confirm: string) =>
    req<{ deleted: boolean; id: string }>(`/tenants/${id}?confirm=${encodeURIComponent(confirm)}`, { method: "DELETE" }),

  users: (params?: { q?: string; tenantId?: string }) => {
    const sp = new URLSearchParams();
    if (params?.q) sp.set("q", params.q);
    if (params?.tenantId) sp.set("tenantId", params.tenantId);
    const qs = sp.toString();
    return req<{ users: AdminUser[] }>(`/users${qs ? `?${qs}` : ""}`);
  },
  setUser: (body: { id: string; role?: string; isActive?: boolean }) =>
    req<{ user: { id: string; role: string; isActive: boolean } }>("/users", { method: "PATCH", body: JSON.stringify(body) }),
  resetUser: (userId: string) =>
    req<{ sent: boolean; email: string }>("/users/reset", { method: "POST", body: JSON.stringify({ userId }) }),
  deleteUser: (id: string) =>
    req<{ deleted: boolean; id: string }>(`/users?id=${encodeURIComponent(id)}`, { method: "DELETE" }),

  leads: (params?: { kind?: string; status?: string }) => {
    const sp = new URLSearchParams();
    if (params?.kind) sp.set("kind", params.kind);
    if (params?.status) sp.set("status", params.status);
    const qs = sp.toString();
    return req<{ leads: AdminLead[]; counts: Record<string, number> }>(`/leads${qs ? `?${qs}` : ""}`);
  },
  setLead: (id: string, status: string) =>
    req<{ lead: AdminLead }>("/leads", { method: "PATCH", body: JSON.stringify({ id, status }) }),

  provision: (body: {
    fullName: string; email: string; phone: string; password: string;
    businessName: string; businessType: string; city: string; plan: string;
  }) => req<ProvisionResult>("/provision", { method: "POST", body: JSON.stringify(body) }),
};
