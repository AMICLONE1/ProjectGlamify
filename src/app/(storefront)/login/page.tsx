import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Glamify",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <a href="/" className="font-display font-extrabold text-2xl text-ink tracking-tight">
            Glamify
          </a>
          <p className="mt-2 text-sm text-muted">Sign in to your business dashboard</p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-muted">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="font-semibold text-brand-600 hover:underline">
            Request access
          </a>
        </p>
      </div>
    </div>
  );
}
