import Link from "next/link";
import { cn } from "@/lib/cn";
import type {
  BusinessSectionAction,
  BusinessSectionHighlight,
  BusinessSectionStat,
} from "@/lib/business-data";

type BusinessSectionPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  status: string;
  stats: BusinessSectionStat[];
  highlights: BusinessSectionHighlight[];
  actions: BusinessSectionAction[];
  note: string;
};

const statToneStyles: Record<BusinessSectionStat["tone"], string> = {
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  sky: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  rose: "border-rose-400/20 bg-rose-400/10 text-rose-200",
};

const highlightToneStyles: Record<BusinessSectionHighlight["tone"], string> = {
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  sky: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  rose: "border-rose-400/20 bg-rose-400/10 text-rose-200",
};

export function BusinessSectionPage({
  eyebrow,
  title,
  description,
  status,
  stats,
  highlights,
  actions,
  note,
}: BusinessSectionPageProps) {
  const highlightGridClass = highlights.length > 2 ? "lg:grid-cols-3" : "lg:grid-cols-2";

  return (
    <div className="space-y-8 text-slate-100">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">{description}</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
            {status}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-white">{stat.value}</p>
            <p className={cn("mt-2 inline-flex rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em]", statToneStyles[stat.tone])}>
              {stat.detail}
            </p>
          </div>
        ))}
      </section>

      <section className={cn("grid gap-5", highlightGridClass)}>
        {highlights.map((highlight) => (
          <div key={highlight.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{highlight.meta}</p>
              <span className={cn("rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em]", highlightToneStyles[highlight.tone])}>
                {highlight.tone}
              </span>
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-white">{highlight.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{highlight.body}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
          >
            <span className="block text-sm font-semibold text-white">{action.label}</span>
            <span className="mt-2 block text-sm text-slate-300">{action.detail}</span>
            <span className="mt-3 block text-cyan-300">→</span>
          </Link>
        ))}
      </section>

      <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">What this module gives you</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-100 sm:text-base">{note}</p>
      </section>
    </div>
  );
}
