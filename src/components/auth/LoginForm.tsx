"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "submitting" | "error";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setStatus("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Invalid email or password");
      }

      localStorage.setItem("glamify_token", data.data.token);
      localStorage.setItem("glamify_user", JSON.stringify(data.data.user));

      router.replace("/business/dashboard");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const inputCls =
    "w-full rounded-2xl border border-border-strong bg-white px-4 py-3 text-sm text-ink placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-ink transition-colors";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-border bg-surface p-7"
      noValidate
    >
      <div className="space-y-1.5">
        <label className="block text-xs uppercase tracking-[0.18em] text-muted font-semibold">
          Email
        </label>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@yourbusiness.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs uppercase tracking-[0.18em] text-muted font-semibold">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls + " pr-12"}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink transition-colors"
            tabIndex={-1}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <p className="text-sm text-brand-600 font-medium" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting" || !email.trim() || !password}
        className="w-full rounded-full bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        {status === "submitting" ? "Signing in…" : "Sign in →"}
      </button>
    </form>
  );
}
