import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

// A clause is either a paragraph, a bullet list, or a labelled sub-clause.
export type Clause =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "sub"; label: string; text: string };

export type LegalSection = {
  id: string;       // anchor / TOC id
  heading: string;
  clauses: Clause[];
};

type Props = {
  title: string;
  intro: string;
  lastUpdated: string;
  badge?: string;
  sections: LegalSection[];
  contactEmail: string;
  contactLabel?: string;
};

function ClauseBlock({ clause }: { clause: Clause }) {
  if (clause.type === "p") {
    return <p className="text-[15px] leading-relaxed text-muted">{clause.text}</p>;
  }
  if (clause.type === "list") {
    return (
      <ul className="space-y-2 pl-1">
        {clause.items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-muted">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    );
  }
  // sub-clause
  return (
    <p className="text-[15px] leading-relaxed text-muted">
      <span className="font-semibold text-ink">{clause.label} </span>
      {clause.text}
    </p>
  );
}

export function LegalDoc({ title, intro, lastUpdated, badge, sections, contactEmail, contactLabel }: Props) {
  return (
    <>
      <section className="relative pt-16 pb-8 sm:pt-20 sm:pb-10">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow mb-8">Legal</p>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-[-0.03em] leading-[0.95] text-ink">
              {title}
            </h1>
            <p className="mt-5 text-sm font-medium text-muted">
              Last updated: {lastUpdated}{badge ? ` · ${badge}` : ""}
            </p>
            <p className="mt-6 text-base leading-relaxed text-muted">{intro}</p>
          </div>
        </Container>
      </section>

      <Section className="pb-16 sm:pb-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            {/* Table of contents */}
            <nav className="mb-12 rounded-3xl border border-border bg-surface p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Contents</p>
              <ol className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="group flex gap-2 text-sm text-muted transition-colors hover:text-ink">
                      <span className="font-mono text-xs text-muted-2 group-hover:text-brand-500">{String(i + 1).padStart(2, "0")}</span>
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* Sections */}
            <div className="space-y-12">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="mb-4 font-display text-xl font-bold text-ink sm:text-2xl">
                    <span className="mr-2 text-brand-500">{String(i + 1).padStart(2, "0")}.</span>
                    {s.heading}
                  </h2>
                  <div className="space-y-3">
                    {s.clauses.map((c, ci) => <ClauseBlock key={ci} clause={c} />)}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-14 rounded-3xl border border-border bg-surface p-8">
              <p className="text-sm leading-relaxed text-muted">
                {contactLabel ?? "Questions about this document?"}{" "}
                <a href={`mailto:${contactEmail}`} className="font-medium text-brand-600 underline underline-offset-4 hover:text-brand-700">
                  {contactEmail}
                </a>
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
