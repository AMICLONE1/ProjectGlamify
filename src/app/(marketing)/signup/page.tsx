import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SignupForm } from "@/components/sections/SignupForm";

export const metadata: Metadata = {
  title: "Get early access — Glamify",
  description:
    "Request early access to Glamify. We set up your storefront for you — live within 48 hours.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/signup" },
};

const benefits = [
  { title: "We set up everything", body: "Our team configures your storefront, services, and hours. You just review and approve." },
  { title: "Live within 48 hours", body: "From your first WhatsApp to your first online booking in under 2 days." },
  { title: "No tech skills needed", body: "We handle it all. You get login credentials and a ready-to-share link." },
];

export default function SignupPage() {
  return (
    <section className="relative pt-16 pb-20 sm:pt-20 sm:pb-24">
      <Container>
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow mb-8">Early access</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95] text-ink">
              Get your storefront live.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted leading-relaxed max-w-md">
              Tell us about your business. Our team reaches out within 24 hours,
              sets up your storefront, and hands you the keys. You start taking
              bookings — we handle the rest.
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
