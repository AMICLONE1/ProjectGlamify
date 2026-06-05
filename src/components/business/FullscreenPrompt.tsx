"use client";

import { useEffect, useState } from "react";

// A small, dismissible desktop-only prompt nudging the user into fullscreen.
// Browsers forbid auto-fullscreen (it needs a user gesture), so we offer a one-tap button.
// Dismissal is remembered for the session so it never nags.

const DISMISS_KEY = "clitell_fullscreen_dismissed";

function isDesktop() {
  if (typeof window === "undefined") return false;
  // Coarse pointer = touch device; we only want this on mouse/desktop with a wide viewport.
  const wide = window.matchMedia("(min-width: 1024px)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  return wide && finePointer;
}

export function FullscreenPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isDesktop()) return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    if (document.fullscreenElement) return;
    // Small delay so it doesn't flash during initial load.
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Hide automatically once the user is in fullscreen (by any means).
  useEffect(() => {
    function onFsChange() {
      if (document.fullscreenElement) setShow(false);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  function goFullscreen() {
    document.documentElement.requestFullscreen?.().catch(() => {});
    setShow(false);
  }

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 hidden -translate-x-1/2 lg:block">
      <div className="flex items-center gap-3 rounded-2xl border border-biz-border bg-biz-surface px-4 py-3 shadow-lg shadow-black/5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-biz-violet-50 text-biz-violet-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        </span>
        <p className="text-sm text-biz-ink">
          <span className="font-semibold">Go fullscreen</span>
          <span className="ml-1 text-biz-muted">for the best experience.</span>
        </p>
        <button
          onClick={goFullscreen}
          className="rounded-full bg-biz-violet-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-biz-violet-600"
        >
          Enter fullscreen
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="flex h-7 w-7 items-center justify-center rounded-full text-biz-muted-2 transition-colors hover:bg-biz-bg hover:text-biz-ink"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </div>
    </div>
  );
}
