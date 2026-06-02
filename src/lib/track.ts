"use client";

import { track as vercelTrack } from "@vercel/analytics";

export type AppEvent =
  | "signup_submitted"
  | "signup_failed"
  | "waitlist_submitted"
  | "waitlist_failed"
  | "demo_submitted"
  | "demo_failed"
  | "contact_submitted"
  | "contact_failed"
  | "cta_clicked";

type Props = Record<string, string | number | boolean | null | undefined>;

/**
 * Thin wrapper around @vercel/analytics. No-ops outside Vercel; safe to call from anywhere.
 */
export function track(event: AppEvent, props?: Props): void {
  try {
    // Vercel Analytics filters undefined; coerce null to empty string to keep types happy.
    const clean: Record<string, string | number | boolean | null> = {};
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (v === undefined) continue;
        clean[k] = v;
      }
    }
    vercelTrack(event, clean);
  } catch {
    // never let analytics break a user flow
  }
}
