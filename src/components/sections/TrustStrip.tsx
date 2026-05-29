import { cn } from "@/lib/cn";

const trustPoints = [
  { value: "500+", label: "Indian businesses" },
  { value: "25k", label: "bookings / month" },
  { value: "₹0", label: "to start" },
  { value: "15 min", label: "setup" },
];

export function TrustStrip({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm", className)}>
      {trustPoints.map((point, i) => (
        <div key={point.label} className="flex items-center gap-2">
          {i > 0 && (
            <span aria-hidden className="hidden sm:inline h-1 w-1 rounded-full bg-border-strong" />
          )}
          <span className="font-display font-bold text-foreground">{point.value}</span>
          <span className="text-muted">{point.label}</span>
        </div>
      ))}
    </div>
  );
}
