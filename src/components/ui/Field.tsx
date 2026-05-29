import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type FieldShellProps = {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
};

export function FieldShell({ label, hint, error, htmlFor, children, className }: FieldShellProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-xs uppercase tracking-[0.18em] text-muted font-semibold"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-brand-600 font-medium">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-2">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  "w-full rounded-2xl border bg-white px-4 py-3 text-base text-ink placeholder:text-muted-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-50";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        inputBase,
        error ? "border-brand-500" : "border-border-strong focus:border-ink",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={5}
      className={cn(
        inputBase,
        "resize-y min-h-[120px]",
        error ? "border-brand-500" : "border-border-strong focus:border-ink",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        inputBase,
        "appearance-none pr-10 bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2012%2012%22%20fill=%22%236b5560%22><path%20d=%22M3%204l3%203%203-3z%22/></svg>')] bg-no-repeat bg-[right_1rem_center] bg-[length:12px_12px]",
        error ? "border-brand-500" : "border-border-strong focus:border-ink",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
