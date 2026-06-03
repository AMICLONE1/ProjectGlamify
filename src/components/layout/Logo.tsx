import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Clitell brand assets — single source of truth.
 *
 * Use the official PNGs in /public (trimmed). The red "i" dot is baked into the
 * artwork, so the brand red is always consistent with the logo.
 *
 *   <ClitellWordmark />  — full "clitell" wordmark (default for headers/footers)
 *   <ClitellMark />      — icon only: the "c" + red dot (favicons, tight spots)
 *
 * Each accepts `variant="black" | "white"` (white for dark backgrounds).
 */

const WORDMARK = {
  black: "/ClitellMarkBlack-trim.png", // file naming is inverted: "Mark*" = wordmark
  white: "/ClitellMarkWhite-trim.png",
} as const;

const MARK = {
  black: "/ClitellLogoBlack-trim.png", // "Logo*" = icon mark (c + dot)
  white: "/ClitellLogoWhite-trim.png",
} as const;

type Variant = "black" | "white";

/** Full "clitell" wordmark image. Intrinsic ratio ≈ 4.37:1. */
export function ClitellWordmark({
  variant = "black",
  className,
  priority,
}: {
  variant?: Variant;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={WORDMARK[variant]}
      alt="Clitell"
      width={437}
      height={100}
      priority={priority}
      className={cn("h-6 w-auto", className)}
    />
  );
}

/** Icon mark: the "c" + red dot. Near-square (≈ 1:1). */
export function ClitellMark({
  variant = "black",
  className,
  priority,
}: {
  variant?: Variant;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={MARK[variant]}
      alt="Clitell"
      width={64}
      height={65}
      priority={priority}
      className={cn("h-8 w-auto", className)}
    />
  );
}

/** Icon mark + wordmark side by side (not linked). */
export function ClitellLockup({
  variant = "black",
  className,
  priority,
}: {
  variant?: Variant;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <ClitellMark variant={variant} priority={priority} className="h-7 w-auto" />
      <ClitellWordmark variant={variant} priority={priority} className="h-6 w-auto" />
    </span>
  );
}

/** Header logo: linked icon mark + wordmark lockup. */
export function Logo({
  className,
  variant = "black",
}: {
  className?: string;
  variant?: Variant;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center", className)}
      aria-label="Clitell home"
    >
      <ClitellLockup variant={variant} priority />
    </Link>
  );
}
