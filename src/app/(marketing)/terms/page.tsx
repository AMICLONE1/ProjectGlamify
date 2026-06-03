import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms under which you may use Clitell's products and services.",
  alternates: { canonical: "/terms" },
};

const sections = [
  { heading: "Acceptance", body: "By creating a Clitell account or using our services, you agree to these terms. If you're agreeing on behalf of a business, you represent that you have authority to bind that business." },
  { heading: "Your account", body: "You're responsible for maintaining the security of your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized access at security@clitell.in." },
  { heading: "Subscription & billing", body: "Paid plans are billed monthly or annually in advance. All fees are in INR exclusive of applicable taxes. Subscription cancellations take effect at the end of the current billing period." },
  { heading: "Acceptable use", body: "You may not use Clitell to send unsolicited communications, store unlawful content, attempt to bypass our security controls, or compete directly with Clitell by reverse-engineering our service." },
  { heading: "Your content", body: "You retain all rights to client data, business information, and content you upload to Clitell. You grant us a limited license to process that content solely to deliver the service." },
  { heading: "Service availability", body: "We target 99.9% uptime. Enterprise customers get a contractual SLA with service credits for downtime. We are not liable for indirect or consequential damages arising from service interruptions." },
  { heading: "Termination", body: "You can cancel anytime from your account settings. We may suspend or terminate accounts that violate these terms after reasonable notice. Upon termination, your data is exportable for 90 days, then permanently deleted." },
  { heading: "Governing law", body: "These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra." },
];

export default function TermsPage() {
  return (
    <>
      <section className="relative pt-16 pb-10 sm:pt-20 sm:pb-12">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow mb-8">Legal</p>
            <h1 className="font-display text-5xl sm:text-6xl font-extrabold uppercase tracking-[-0.03em] leading-[0.95] text-ink">
              Terms of service
            </h1>
            <p className="mt-6 text-sm text-muted font-medium">Last updated: May 28, 2026</p>
          </div>
        </Container>
      </section>

      <Section className="py-12 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl space-y-10">
            {sections.map((s) => (
              <div key={s.heading}>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-4">
                  {s.heading}
                </h2>
                <p className="text-base sm:text-lg text-muted leading-relaxed">{s.body}</p>
              </div>
            ))}

            <div className="rounded-3xl border border-border bg-surface p-8">
              <p className="text-sm text-muted leading-relaxed">
                Questions about these terms?{" "}
                <a
                  href="mailto:legal@clitell.in"
                  className="text-brand-600 hover:text-brand-700 underline underline-offset-4 font-medium"
                >
                  legal@clitell.in
                </a>
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
