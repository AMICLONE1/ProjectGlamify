import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SignupForm } from "@/components/sections/SignupForm";

export const metadata: Metadata = {
  title: "Start free — Create your Glamify account",
  description:
    "Free forever for solo professionals. Operational in 15 minutes. No card required.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/signup" },
};

const benefits = [
  { title: "Free forever for solo pros", body: "One staff seat, 50 appointments/month, basic billing." },
  { title: "Operational in 15 minutes", body: "Guided wizard. Real humans on chat if you get stuck." },
  { title: "Cancel anytime", body: "No long-term contracts. Your data exports in one click." },
];

export default function SignupPage() {
  return (
    <section className="relative pt-16 pb-20 sm:pt-20 sm:pb-24">
      <Container>
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow mb-8">Start free</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95] text-ink">
              Create your Glamify account.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted leading-relaxed max-w-md">
              Two minutes to sign up. Thirteen to set up your services, staff, and
              working hours. You&apos;ll be taking bookings before lunch.
            </p>

            <ul className="mt-10 space-y-5">
              {benefits.map((b) => (
                <li key={b.title} className="flex items-start gap-4">
                  <span
                    aria-hidden
                    className="shrink-0 h-7 w-7 rounded-full bg-brand-500 grid place-items-center text-white text-sm font-bold"
                  >
                    ✓
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-ink">{b.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{b.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SignupForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
