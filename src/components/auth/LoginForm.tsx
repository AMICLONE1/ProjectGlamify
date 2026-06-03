"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getSupabaseBrowser,
  resetSupabaseBrowser,
  getRememberPreference,
  setRememberPreference,
} from "@/lib/supabase/client";
import { setToken, setUser, getRememberedEmail, setRememberedEmail } from "@/lib/session";

type Status = "idle" | "submitting" | "error";
type ResetStatus = "idle" | "sending" | "sent" | "error";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Pre-fill the remembered email + the remember preference on mount.
  useEffect(() => {
    const saved = getRememberedEmail();
    if (saved) setEmail(saved);
    setRemember(getRememberPreference());
  }, []);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetStatus, setResetStatus] = useState<ResetStatus>("idle");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  async function handleForgotPassword() {
    if (!resetEmail.trim()) return;
    setResetStatus("sending");
    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setResetStatus("sent");
    } catch {
      setResetStatus("error");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setStatus("submitting");
    setErrorMessage(null);

    try {
      // Apply the remember-me preference, then rebuild the client so the session
      // is written to the correct storage (localStorage vs sessionStorage).
      setRememberPreference(remember);
      setRememberedEmail(remember ? email : "");
      const supabase = resetSupabaseBrowser();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error || !data.session) {
        throw new Error(error?.message ?? "Invalid email or password");
      }

      const token = data.session.access_token;
      setToken(token);

      // Hydrate the tenant-scoped user profile from our DB
      const meRes = await fetch("/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const me = await meRes.json().catch(() => null);
      if (!meRes.ok || !me?.data) {
        throw new Error(me?.error?.message ?? "Your account is not set up. Contact Clitell.");
      }
      setUser({
        id: me.data.id,
        fullName: me.data.fullName,
        email: me.data.email,
        role: me.data.role,
        tenantId: me.data.tenantId,
        locationId: me.data.locationId ?? null,
      });

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

      <label className="flex items-center gap-2.5 cursor-pointer select-none py-0.5">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 rounded border-border-strong text-brand-500 accent-brand-500 focus:ring-2 focus:ring-brand-500/30"
        />
        <span className="text-sm text-muted">
          Remember me
          <span className="block text-xs text-muted-2">Stay signed in on this device</span>
        </span>
      </label>

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

      <button
        type="button"
        onClick={() => { setShowReset((v) => !v); setResetEmail(email); setResetStatus("idle"); }}
        className="w-full text-center text-xs text-muted hover:text-ink transition-colors"
      >
        Forgot password?
      </button>

      {showReset && (
        <div className="rounded-2xl border border-border bg-surface-2 p-4 space-y-3">
          <p className="text-xs font-semibold text-ink">Reset your password</p>
          {resetStatus === "sent" ? (
            <p className="text-xs text-green-600">Check your email — we sent a reset link.</p>
          ) : (
            <>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="your@email.com"
                className={inputCls}
              />
              {resetStatus === "error" && (
                <p className="text-xs text-brand-600">Failed to send. Check the email address and try again.</p>
              )}
              <button
                type="button"
                disabled={!resetEmail.trim() || resetStatus === "sending"}
                onClick={handleForgotPassword}
                className="w-full rounded-full bg-brand-500 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
              >
                {resetStatus === "sending" ? "Sending…" : "Send reset link"}
              </button>
            </>
          )}
        </div>
      )}
    </form>
  );
}
