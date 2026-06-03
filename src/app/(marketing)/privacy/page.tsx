import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Clitell collects, uses, and protects your personal data.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  { heading: "Who we are", body: "Clitell Technologies Pvt Ltd is the data controller for personal data processed via clitell.in, the Clitell Business platform, and the Clitell consumer app. We are headquartered in Mumbai, India." },
  { heading: "What we collect", body: "Account information (name, email, phone), business details (business name, location, GSTIN), payment and billing information (processed by Razorpay; we do not store card data), and usage data (pages visited, features used) to improve the product." },
  { heading: "How we use your data", body: "To deliver the Clitell service, send transactional communications (booking confirmations, receipts), prevent fraud, and improve our product. We do not sell your personal data to third parties." },
  { heading: "DPDPA compliance", body: "Clitell complies with India's Digital Personal Data Protection Act, 2023. You have the right to access, correct, port, and delete your personal data. Contact privacy@clitell.in to exercise these rights." },
  { heading: "Data retention", body: "Active account data is retained for the duration of your subscription plus 90 days after cancellation. Financial records are retained for 7 years per Indian tax law." },
  { heading: "Security", body: "Personal data is encrypted at rest (AES-256) and in transit (TLS 1.3). Field-level encryption is used for sensitive client information. We undergo annual security audits." },
  { heading: "Changes to this policy", body: "We'll notify you by email at least 30 days before any material change to this policy. Continued use of Clitell after the effective date constitutes acceptance of the updated policy." },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="relative pt-16 pb-10 sm:pt-20 sm:pb-12">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow mb-8">Legal</p>
            <h1 className="font-display text-5xl sm:text-6xl font-extrabold uppercase tracking-[-0.03em] leading-[0.95] text-ink">
              Privacy policy
            </h1>
            <p className="mt-6 text-sm text-muted font-medium">
              Last updated: May 28, 2026 · DPDPA-compliant
            </p>
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
                Questions about this policy or your data?{" "}
                <a
                  href="mailto:privacy@clitell.in"
                  className="text-brand-600 hover:text-brand-700 underline underline-offset-4 font-medium"
                >
                  privacy@clitell.in
                </a>
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
