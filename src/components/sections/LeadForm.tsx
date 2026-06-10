"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldShell, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/track";

const leadSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(80),
  phone: z.string().regex(/^[0-9+\-\s()]{8,18}$/, "Enter a valid phone number"),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
  businessName: z.string().min(2, "Business name is required").max(120),
  businessType: z.enum(["salon", "spa", "clinic", "barbershop", "tattoo", "other"]),
  city: z.string().min(2, "City is required").max(80),
  message: z.string().max(800).optional(),
});

type LeadInput = z.infer<typeof leadSchema>;
type Status = "idle" | "submitting" | "success" | "error";

export function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { businessType: "salon" },
  });

  async function onSubmit(values: LeadInput) {
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "waitlist", payload: values }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "Something went wrong");
      }
      track("waitlist_submitted", { businessType: values.businessType, city: values.city });
      reset();
      setStatus("success");
    } catch (err) {
      track("waitlist_failed", { reason: err instanceof Error ? err.message : "unknown" });
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-brand-500 bg-brand-50 p-10 text-center">
        <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-brand-500 grid place-items-center text-white text-3xl font-bold">
          ✓
        </div>
        <h3 className="font-display text-3xl font-extrabold uppercase tracking-tight text-ink mb-3">
          We&apos;ll be in touch.
        </h3>
        <p className="text-muted text-lg leading-relaxed max-w-md mx-auto">
          Our team will reach out within 24 hours on WhatsApp or email to get your
          storefront set up and walk you through the platform.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl border border-border bg-surface p-7 sm:p-9"
      noValidate
    >
      <div className="rounded-2xl bg-brand-50 border border-brand-200 px-4 py-3 text-sm text-brand-700 font-medium">
        We set up everything for you — your storefront will be live within 48 hours.
      </div>

      <FieldShell label="Your name" htmlFor="lead-name" error={errors.fullName?.message}>
        <Input
          id="lead-name"
          autoComplete="name"
          placeholder="Priya Mehta"
          error={!!errors.fullName}
          {...register("fullName")}
        />
      </FieldShell>

      <div className="grid sm:grid-cols-2 gap-5">
        <FieldShell label="WhatsApp / Phone" htmlFor="lead-phone" error={errors.phone?.message}>
          <Input
            id="lead-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            error={!!errors.phone}
            {...register("phone")}
          />
        </FieldShell>
        <FieldShell label="Email (optional)" htmlFor="lead-email" error={errors.email?.message}>
          <Input
            id="lead-email"
            type="email"
            autoComplete="email"
            placeholder="you@yoursalon.com"
            error={!!errors.email}
            {...register("email")}
          />
        </FieldShell>
      </div>

      <FieldShell label="Business name" htmlFor="lead-business" error={errors.businessName?.message}>
        <Input
          id="lead-business"
          autoComplete="organization"
          placeholder="Studio P Salon"
          error={!!errors.businessName}
          {...register("businessName")}
        />
      </FieldShell>

      <div className="grid sm:grid-cols-2 gap-5">
        <FieldShell label="City" htmlFor="lead-city" error={errors.city?.message}>
          <Input
            id="lead-city"
            autoComplete="address-level2"
            placeholder="Pune"
            error={!!errors.city}
            {...register("city")}
          />
        </FieldShell>
        <FieldShell label="Business type" htmlFor="lead-type" error={errors.businessType?.message}>
          <Select id="lead-type" error={!!errors.businessType} {...register("businessType")}>
            <option value="salon">Salon</option>
            <option value="spa">Spa / Wellness</option>
            <option value="clinic">Beauty clinic</option>
            <option value="barbershop">Barbershop</option>
            <option value="tattoo">Tattoo studio</option>
            <option value="other">Other</option>
          </Select>
        </FieldShell>
      </div>

      <FieldShell
        label="Anything specific you want us to know? (optional)"
        htmlFor="lead-message"
        error={errors.message?.message}
      >
        <Textarea
          id="lead-message"
          placeholder="e.g. We want a demo, or we need help with no-shows and inventory."
          error={!!errors.message}
          {...register("message")}
        />
      </FieldShell>

      {errorMessage && (
        <p className="text-sm text-brand-600 font-medium" role="alert">
          {errorMessage}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting…" : "Get started — it's free"}
        {status !== "submitting" && <span aria-hidden>→</span>}
      </Button>

      <p className="text-xs text-muted/80 text-center leading-relaxed">
        No payment required. Our team contacts you within 24 hours. By submitting you agree to our{" "}
        <a href="/terms" className="underline underline-offset-4 hover:text-foreground transition-colors">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline underline-offset-4 hover:text-foreground transition-colors">
          Privacy policy
        </a>
        .
      </p>
    </form>
  );
}
