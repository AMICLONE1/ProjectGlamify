"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/effects/Magnetic";
import { HeroPreview } from "./HeroPreview";
import { TrustStrip } from "./TrustStrip";

const HERO_LINES = [
  ["Run", "your", "salon."],
  ["Bill,", "book,", "grow."],
];

const floatingDots = [
  { left: "10%", top: "16%", size: 12, duration: 12, delay: 0, tone: "bg-brand-400/70" },
  { left: "18%", top: "74%", size: 8, duration: 10, delay: 0.8, tone: "bg-brand-300/65" },
  { left: "28%", top: "28%", size: 6, duration: 14, delay: 0.4, tone: "bg-gold-400/70" },
  { left: "62%", top: "18%", size: 10, duration: 11, delay: 1.2, tone: "bg-brand-500/60" },
  { left: "72%", top: "64%", size: 7, duration: 13, delay: 0.3, tone: "bg-gold-300/70" },
  { left: "84%", top: "34%", size: 9, duration: 15, delay: 1.1, tone: "bg-plum-500/50" },
  { left: "44%", top: "82%", size: 6, duration: 9, delay: 0.5, tone: "bg-brand-400/60" },
  { left: "56%", top: "54%", size: 14, duration: 16, delay: 0.9, tone: "bg-brand-500/45" },
];

function SplitLine({ words, tone }: { words: string[]; tone?: string }) {
  return (
    <>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="inline-block whitespace-nowrap">
          <span data-hero-word className={`hero-word ${tone ?? ""}`}>
            {word}
          </span>
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set("[data-hero-element]", { opacity: 1, y: 0 });
        gsap.set("[data-hero-word]", { opacity: 1, y: 0, rotateX: 0 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to("[data-hero-element='badge']", { opacity: 1, y: 0, duration: 0.5 }, 0.1)
        .to(
          "[data-hero-word]",
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.7,
            ease: "back.out(1.4)",
            stagger: 0.08,
          },
          0.14
        )
        .to("[data-hero-element='subtext']", { opacity: 1, y: 0, duration: 0.6 }, "-=0.25")
        .to("[data-hero-element='cta']", { opacity: 1, y: 0, duration: 0.6 }, "-=0.25")
        .to("[data-hero-element='note']", { opacity: 1, y: 0, duration: 0.5 }, "-=0.25")
        .to("[data-hero-element='trust']", { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
        .to("[data-hero-element='preview']", { opacity: 1, y: 0, duration: 0.7 }, "-=0.45");
    }, rootRef);

    const heroRoot = rootRef.current;
    if (!heroRoot || reduce || !hasHover) {
      return () => ctx.revert();
    }

    const root = heroRoot as HTMLElement;

    let frameId = 0;

    function setPointerVars(event: PointerEvent) {
      const bounds = root.getBoundingClientRect();
      const offsetX = event.clientX - (bounds.left + bounds.width / 2);
      const offsetY = event.clientY - (bounds.top + bounds.height / 2);

      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        root.style.setProperty("--hero-pointer-x", `${offsetX}px`);
        root.style.setProperty("--hero-pointer-y", `${offsetY}px`);
      });
    }

    function resetPointerVars() {
      root.style.setProperty("--hero-pointer-x", "0px");
      root.style.setProperty("--hero-pointer-y", "0px");
    }

    root.addEventListener("pointermove", setPointerVars);
    root.addEventListener("pointerleave", resetPointerVars);

    return () => {
      cancelAnimationFrame(frameId);
      root.removeEventListener("pointermove", setPointerVars);
      root.removeEventListener("pointerleave", resetPointerVars);
      root.style.removeProperty("--hero-pointer-x");
      root.style.removeProperty("--hero-pointer-y");
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative isolate overflow-hidden pt-10 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28"
    >
      <div aria-hidden className="absolute inset-0 -z-30 bg-background" />
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_18%,rgba(255,120,96,0.18),transparent_30%),radial-gradient(circle_at_80%_14%,rgba(154,111,68,0.14),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(106,44,90,0.09),transparent_30%)]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 hero-grid opacity-55" />

      <div aria-hidden className="absolute left-[-12%] top-[-14%] -z-10 h-112 w-md rounded-full bg-brand-500/12 blur-[140px]" />
      <div aria-hidden className="absolute right-[-10%] top-[10%] -z-10 h-120 w-120 rounded-full bg-plum-500/10 blur-[160px]" />
      <div aria-hidden className="absolute bottom-[-18%] left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-gold-500/10 blur-[150px]" />

      <div aria-hidden className="hero-dot-layer absolute inset-0 -z-10">
        {floatingDots.map((dot) => (
          <span
            key={`${dot.left}-${dot.top}`}
            className="absolute block"
            style={{ left: dot.left, top: dot.top }}
          >
            <span
              className={`hero-float-dot block rounded-full ${dot.tone}`}
              style={{
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                animationDelay: `${dot.delay}s`,
                animationDuration: `${dot.duration}s`,
                boxShadow: "0 0 24px rgba(255, 88, 64, 0.2)",
              }}
            />
          </span>
        ))}
      </div>

      <Container className="relative z-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <div data-hero-element="badge" className="hero-fade-element mb-8">
            <Link
              href="/book-demo"
              className="inline-flex items-center gap-3 rounded-full border border-border-strong bg-surface/80 px-4 py-1.5 text-[11px] font-medium text-muted shadow-sm backdrop-blur-xl transition-colors hover:border-brand-300 hover:text-ink"
            >
              <span className="inline-flex h-5 items-center rounded-full bg-brand-500 px-2 text-[10px] uppercase tracking-[0.2em] text-white">
                New
              </span>
              <span className="hidden sm:inline">Built for salons, spas & clinics in India</span>
              <span className="sm:hidden">Built for beauty businesses</span>
              <span className="text-brand-500">Book a demo →</span>
            </Link>
          </div>

          <h1
            className="max-w-5xl font-display font-extrabold uppercase text-ink leading-[0.92] tracking-[-0.02em] text-[clamp(2.5rem,7vw,6.25rem)]"
            style={{ perspective: "1000px" }}
          >
            <span className="block">
              <SplitLine words={HERO_LINES[0]} />
            </span>
            <span className="mt-2 block text-brand-500 sm:mt-3">
              <SplitLine words={HERO_LINES[1]} tone="text-brand-500" />
            </span>
          </h1>

          <div className="mt-8 max-w-3xl sm:mt-10">
            <p
              data-hero-element="subtext"
              className="hero-fade-element text-base leading-relaxed text-muted sm:text-lg lg:text-xl"
            >
              Bookings, billing, CRM, loyalty, and AI insights built for India&apos;s salons,
              spas, and clinics. Replace your messy stack with one beautiful platform.
            </p>

            <div
              data-hero-element="cta"
              className="hero-fade-element mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
            >
              <Magnetic strength={0.4}>
                <Button href="/signup" size="lg" variant="primary" className="w-full sm:w-auto">
                  Start free <span aria-hidden>→</span>
                </Button>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Button href="/book-demo" size="lg" variant="secondary" className="w-full sm:w-auto">
                  Book a demo
                </Button>
              </Magnetic>
            </div>

            <p
              data-hero-element="note"
              className="hero-fade-element mt-6 text-xs uppercase tracking-[0.2em] text-muted-2"
            >
              Free forever for solo professionals · 15-minute setup · No card required
            </p>

            <div data-hero-element="trust" className="hero-fade-element mt-8">
              <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-muted-2">
                Trusted by beauty businesses across India
              </p>
              <div className="rounded-full border border-border-strong bg-surface/75 px-5 py-4 shadow-sm backdrop-blur-xl">
                <TrustStrip />
              </div>
            </div>
          </div>

          <div data-hero-element="preview" className="hero-fade-element mt-10 w-full lg:mt-14">
            <HeroPreview />
          </div>
        </div>
      </Container>
    </section>
  );
}
