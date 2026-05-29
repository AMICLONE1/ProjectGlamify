"use client";

import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "smooth";

    return () => {
      root.style.scrollBehavior = previous;
    };
  }, []);

  return null;
}
