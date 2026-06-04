"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type AdminUser } from "@/lib/admin-api";

const ROLES = ["owner", "manager", "staff", "receptionist"];

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const { data, isLoading, isError, error } = useQuery({ queryKey: ["admin-users", q], queryFn: () => adminApi.users({ q }) });

  const update = useMutation({
    mutationFn: (body: { id: string; role?: string; isActive?: boolean }) => adminApi.setUser(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const reset = useMutation({
    mutationFn: (userId: string) => adminApi.resetUser(userId),
    onSuccess: (r) => { setToast(`Reset link sent to ${r.email}`); setTimeout(() => setToast(null), 4000); },
    onError: (e) => { setToast((e as Error).message); setTimeout(() => setToast(null), 4000); },
  });

  const users = data?.users ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Users</h1>
          <p className="text-sm text-zinc-400">{users.length} across all businesses</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or email…"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none sm:w-72"
        />
      </div>

      {toast && <p className="rounded-xl bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200">{toast}</p>}

      {isError && (
        <p className="rounded-xl bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {(error as Error)?.message ?? "Failed to load users"}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : users.length === 0 && !isError ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-500">No users found.</p>
      ) : (
        <div className="space-y-2.5">
          {users.map((u) => (
            <UserRow
              key={u.id}
              u={u}
              busy={update.isPending || reset.isPending}
              onRole={(role) => update.mutate({ id: u.id, role })}
              onToggle={() => update.mutate({ id: u.id, isActive: !u.isActive })}
              onReset={() => reset.mutate(u.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UserRow({ u, onRole, onToggle, onReset, busy }: {
  u: AdminUser; onRole: (r: string) => void; onToggle: () => void; onReset: () => void; busy: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{u.fullName}</p>
            {!u.isActive && <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">Inactive</span>}
          </div>
          <p className="truncate text-xs text-zinc-500">{u.email}</p>
          <p className="mt-1.5 text-[11px] text-zinc-500">
            {u.tenant.name} · last login {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "never"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={u.role}
            disabled={busy}
            onChange={(e) => onRole(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs capitalize text-zinc-200 focus:outline-none"
          >
            {ROLES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
          </select>
          <button disabled={busy} onClick={onReset}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 disabled:opacity-50">
            Reset password
          </button>
          <button disabled={busy} onClick={onToggle}
            className={u.isActive
              ? "rounded-lg border border-red-900 bg-red-950/50 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/50 disabled:opacity-50"
              : "rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"}>
            {u.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}
