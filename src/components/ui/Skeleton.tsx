import { cn } from "@/lib/cn";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Use the dark palette for the admin console (zinc surfaces). */
  dark?: boolean;
};

/**
 * Animated shimmer placeholder for loading states inside the web app
 * (business dashboard + admin console). Defaults to the light biz palette;
 * pass `dark` on admin screens, or wrap a group in a `.skeleton-dark` parent.
 *
 * Shape it with utility classes — height, width, and rounding all come from
 * `className`, e.g. <Skeleton className="h-7 w-20 rounded-xl" />.
 */
export function Skeleton({ className, dark, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn("skeleton rounded-md", dark && "skeleton-dark", className)}
      {...props}
    />
  );
}

/**
 * Stack of card-shaped placeholders — matches the list layouts in the admin
 * console (tenants / users / leads). Defaults to the dark palette.
 */
export function SkeletonRows({
  rows = 5,
  dark = true,
  rowClassName = "h-16 rounded-2xl",
  className = "space-y-2.5",
}: {
  rows?: number;
  dark?: boolean;
  rowClassName?: string;
  className?: string;
}) {
  return (
    <div className={className} aria-busy>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} dark={dark} className={rowClassName} />
      ))}
    </div>
  );
}

/**
 * Convenience wrapper for multi-line text placeholders. The last line is
 * rendered narrower to read like the end of a paragraph.
 */
export function SkeletonText({
  lines = 3,
  dark,
  className,
}: {
  lines?: number;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          dark={dark}
          className={cn("h-3 rounded-full", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}
