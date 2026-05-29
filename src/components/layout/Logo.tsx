import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 font-display font-bold text-xl tracking-tight",
        className
      )}
      aria-label="Glamify home"
    >
      <span
        aria-hidden
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white text-sm font-bold"
      >
        G
      </span>
      <span className="text-ink">Glamify</span>
    </Link>
  );
}
