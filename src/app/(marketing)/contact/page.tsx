import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/sections/ContactForm";

export const metadata: Metadata = {
  title: "Contact — Talk to the Glamify team",
  description:
    "Sales, support, partnerships, or just to say hi. We're based in Mumbai and reply within one business day.",
  alternates: { canonical: "/contact" },
};

const channels = [
  { label: "Sales", value: "hello@glamify.in", href: "mailto:hello@glamify.in", hint: "Enterprise quotes, partnerships, custom plans." },
  { label: "Support", value: "support@glamify.in", href: "mailto:support@glamify.in", hint: "Existing customers: bug reports and questions." },
  { label: "Press & media", value: "press@glamify.in", href: "mailto:press@glamify.in", hint: "Media inquiries and brand assets." },
];

export default function ContactPage() {
  return (
    <>
      <section className="relative pt-16 pb-10 sm:pt-20 sm:pb-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            <p className="eyebrow mb-8">Contact</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-[-0.03em] leading-[0.95] text-ink">
              We&apos;d love to hear from you.
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-muted leading-relaxed max-w-2xl">
              Questions about Glamify, partnership ideas, press requests, or feedback
              — we&apos;re a small team in Mumbai and we reply within one business day.
            </p>
          </div>
        </Container>
      </section>

      <Section className="py-16 sm:py-20 border-t border-border">
        <Container>
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12">
            <div className="space-y-8">
              <div>
                <p className="eyebrow mb-6">Direct channels</p>
                <ul className="space-y-4">
                  {channels.map((c) => (
                    <li key={c.label} className="rounded-2xl border border-border bg-surface p-5">
                      <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-brand-600 mb-1">
                        {c.label}
                      </p>
                      <a
                        href={c.href}
                        className="font-display text-lg font-bold text-ink hover:text-brand-600 transition-colors"
                      >
                        {c.value}
                      </a>
                      <p className="mt-1 text-sm text-muted">{c.hint}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-brand-600 mb-2">
                  Our office
                </p>
                <p className="font-display text-lg font-bold text-ink mb-1">Mumbai, India</p>
                <p className="text-sm text-muted leading-relaxed">
                  Glamify Technologies Pvt Ltd
                  <br />
                  Bandra Kurla Complex
                  <br />
                  Mumbai 400051
                </p>
              </div>
            </div>

            <div>
              <p className="eyebrow mb-6">Send us a message</p>
              <ContactForm />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
