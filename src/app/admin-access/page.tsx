"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminAccessPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/admin/bypass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      if (res.ok) {
        router.replace("/admin");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Invalid secret");
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center text-sm font-semibold tracking-widest text-zinc-500 uppercase">
          Platform Admin
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Admin secret</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter your admin secret key"
              required
              autoFocus
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !secret}
            className="w-full rounded-xl bg-zinc-100 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-white disabled:opacity-40"
          >
            {loading ? "Verifying…" : "Access admin →"}
          </button>
        </form>
      </div>
    </div>
  );
}
