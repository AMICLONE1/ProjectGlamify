"use client";

/**
 * Custom SVG ornaments for the marketing pages.
 *
 * Every ornament is decorative: callers should keep them `aria-hidden` (set
 * by default here) and non-interactive. Animated variants respect
 * prefers-reduced-motion either via the CSS classes in globals.css
 * (.twinkle / .float-soft / .spin-slow) or via useReducedMotion.
 */

import { motion, useReducedMotion } from "motion/react";

type SvgProps = {
  className?: string;
  style?: React.CSSProperties;
};

/* ── Sparkle — 4-point star ─────────────────────────────────────────────── */

export function Sparkle({ className, style }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden>
      <path d="M12 0c.9 5.3 2.6 8 6 9.4 1.7.7 3.7 1.6 6 2.6-2.3 1-4.3 1.9-6 2.6-3.4 1.4-5.1 4.1-6 9.4-.9-5.3-2.6-8-6-9.4-1.7-.7-3.7-1.6-6-2.6 2.3-1 4.3-1.9 6-2.6 3.4-1.4 5.1-4.1 6-9.4Z" />
    </svg>
  );
}

/** A loose cluster of twinkling sparkles, absolutely positioned by the parent. */
export function SparkleField({
  className,
  sparkles,
}: {
  className?: string;
  sparkles: { left: string; top: string; size: number; delay?: number; tone?: string }[];
}) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className ?? ""}`} aria-hidden>
      {sparkles.map((s, i) => (
        <span key={i} className="absolute" style={{ left: s.left, top: s.top }}>
          <Sparkle
            className={`twinkle ${s.tone ?? "text-brand-400/70"}`}
            style={{
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay ?? 0}s`,
            }}
          />
        </span>
      ))}
    </div>
  );
}

/* ── Squiggle — hand-drawn underline that draws itself in ───────────────── */

export function Squiggle({
  className,
  delay = 0,
}: SvgProps & { delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <svg viewBox="0 0 220 14" fill="none" className={className} aria-hidden>
      <motion.path
        d="M3 9.5C25 3.5 44 12.5 66 7.5s44-7 66-1.5 44 7.5 62-1 18-2.5 23 3"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.9, delay, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ── Salon line art — scissors & comb ───────────────────────────────────── */

export function ScissorsMark({ className, style }: SvgProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} style={style} aria-hidden>
      <circle cx="14" cy="44" r="7" stroke="currentColor" strokeWidth="3" />
      <circle cx="14" cy="20" r="7" stroke="currentColor" strokeWidth="3" />
      <path
        d="M20 40 54 14M20 24l34 26M40 25.5l4.6-3.5M40 38.5l4.6 3.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CombMark({ className, style }: SvgProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} style={style} aria-hidden>
      <path
        d="M10 18h44a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-4a4 4 0 0 1 4-4Z"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M14 30v16M22 30v12M30 30v16M38 30v12M46 30v16"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Big quotation mark for testimonials ────────────────────────────────── */

export function QuoteMark({ className, style }: SvgProps) {
  return (
    <svg viewBox="0 0 48 36" fill="currentColor" className={className} style={style} aria-hidden>
      <path d="M10.8 36C4 36 0 31.3 0 24.6 0 14.4 7 5.4 17.6 0l3.6 5.6c-6.3 3.4-10 7.8-10.8 12.6 1-.5 2.2-.7 3.4-.7 5 0 8.6 3.6 8.6 8.8 0 5.6-4.6 9.7-11.6 9.7Zm26.2 0c-6.8 0-10.8-4.7-10.8-11.4C26.2 14.4 33.2 5.4 43.8 0l3.6 5.6c-6.3 3.4-10 7.8-10.8 12.6 1-.5 2.2-.7 3.4-.7 5 0 8.6 3.6 8.6 8.8 0 5.6-4.6 9.7-11.6 9.7Z" />
    </svg>
  );
}

/* ── Service icons — 28px stroke icons for the Services cards ───────────── */

export function StorefrontIcon({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden>
      <path
        d="M4 11 5.6 5h16.8L24 11M4 11v1.5a3 3 0 0 0 5 2.24A3 3 0 0 0 14 14.5a3 3 0 0 0 5 2.24 3 3 0 0 0 5-2.24V11M4 11h20M6 16.8V24h16v-7.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11 24v-5h6v5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function OtpShieldIcon({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden>
      <path
        d="M14 3 5 6.4v6.1c0 5.7 3.7 9.8 9 12.5 5.3-2.7 9-6.8 9-12.5V6.4L14 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m10.2 14.1 2.6 2.6 5-5.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchSparkIcon({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="2" />
      <path d="m17.6 17.6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 8.6c.4 2.1 1 3 3.4 3.4-2.4.4-3 1.3-3.4 3.4-.4-2.1-1-3-3.4-3.4 2.4-.4 3-1.3 3.4-3.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ── AI spark — small filled spark used in insight tags ─────────────────── */

export function AISpark({ className, style }: SvgProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} style={style} aria-hidden>
      <path d="M8 0c.55 3.2 1.55 4.85 3.6 5.7l2.4 1L11.6 8c-2.05.85-3.05 2.5-3.6 5.7C7.45 10.5 6.45 8.85 4.4 8L2 7l2.4-1.3C6.45 4.85 7.45 3.2 8 0Z" />
    </svg>
  );
}

/* ── Orbit ring — slow-spinning dashed circle, used as a backdrop accent ── */

export function OrbitRing({ className, style }: SvgProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} style={style} aria-hidden>
      <g className="spin-slow">
        <circle
          cx="60"
          cy="60"
          r="54"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="3 10"
          strokeLinecap="round"
        />
        <circle cx="60" cy="6" r="3.5" fill="currentColor" />
      </g>
    </svg>
  );
}

/* ── Dashed connector — draws itself across the Process steps ───────────── */

export function DashedConnector({ className }: SvgProps) {
  const reduceMotion = useReducedMotion();
  return (
    <svg
      viewBox="0 0 1200 24"
      fill="none"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <motion.path
        d="M0 12C150 2 300 22 450 12s300-10 450 0 200 0 300 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 10"
        strokeLinecap="round"
        initial={{ pathLength: reduceMotion ? 1 : 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
    </svg>
  );
}
