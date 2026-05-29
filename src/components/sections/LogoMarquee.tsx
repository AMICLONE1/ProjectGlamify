"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const businesses = [
  "Lakmé Salon",
  "Bodycraft Spa",
  "VLCC Clinic",
  "Looks Salon",
  "Naturals",
  "Jean-Claude Biguine",
  "Truefitt & Hill",
  "Enrich Salon",
  "BBlunt",
  "Geetanjali Salon",
];

export function LogoMarquee() {
  const reduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const doubled = [...businesses, ...businesses];

  return (
    <section className="relative py-10 border-y border-border bg-surface">
      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-2 font-semibold">
          Trusted by 500+ beauty & wellness businesses across India
        </p>
      </div>

      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div aria-hidden className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-surface to-transparent z-10" />
        <div aria-hidden className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-surface to-transparent z-10" />

        <motion.div
          className="flex gap-16 whitespace-nowrap"
          animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
          transition={{
            duration: isHovered ? 100 : 35,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {doubled.map((name, i) => (
            <span
              key={i}
              className="font-display text-xl font-semibold tracking-tight text-muted hover:text-ink transition-colors shrink-0"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
