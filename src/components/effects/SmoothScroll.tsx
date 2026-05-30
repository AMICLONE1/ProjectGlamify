"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SmoothScroll() {
  const pathname = usePathname();
  const skip = pathname.startsWith("/business");

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (skip) return;

    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "smooth";

    return () => {
      root.style.scrollBehavior = previous;
    };
  }, [skip]);

  return null;
}
