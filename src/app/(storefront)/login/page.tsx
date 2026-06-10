import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { ClitellWordmark } from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: "Sign in — Clitell",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <a href="/" className="inline-flex items-center justify-center">
            <ClitellWordmark className="h-8 w-auto" priority />
          </a>
          <p className="mt-2 text-sm text-muted">Sign in to your business dashboard</p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-muted">
          Don&apos;t have an account?{" "}
          <a href="/book-demo" className="font-semibold text-brand-600 hover:underline">
            Request access
          </a>
        </p>
      </div>
    </div>
  );
}
