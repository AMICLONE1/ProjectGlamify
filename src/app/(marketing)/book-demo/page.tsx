import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { DemoForm } from "@/components/sections/DemoForm";

export const metadata: Metadata = {
  title: "Book a demo — See Clitell in action",
  description:
    "30-minute walkthrough with our team. We'll show you how Clitell fits your business and answer every question. No card required.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/book-demo" },
};

const whatToExpect = [
  { title: "30 minutes, end-to-end", body: "We'll show you booking, billing, CRM, loyalty, and AI insights — tailored to your business type." },
  { title: "Real questions, real answers", body: "Bring your messiest workflow. Our team has likely already solved it for another customer." },
  { title: "No pressure", body: "We don't gate features behind sales calls. You can start free without ever talking to us." },
];

export default function BookDemoPage() {
  return (
    <section className="relative pt-16 pb-20 sm:pt-20 sm:pb-24">
      <Container>
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow mb-8">Book a demo</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95] text-ink">
              See Clitell in action.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted leading-relaxed max-w-md">
              A 30-minute walkthrough with a real human. We&apos;ll tailor it to your
              business type, show the AI features in action, and answer every question.
            </p>

            <ul className="mt-10 space-y-5">
              {whatToExpect.map((b) => (
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

            <p className="mt-10 text-sm text-muted">
              Prefer to dive straight in?{" "}
              <a href="/signup" className="text-brand-600 hover:text-brand-700 underline underline-offset-4 font-medium">
                Start free
              </a>
              .
            </p>
          </div>

          <div>
            <DemoForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
