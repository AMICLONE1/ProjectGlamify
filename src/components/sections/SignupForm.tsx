"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldShell, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/track";
import { waitlistSchema, type WaitlistInput } from "@/lib/schemas";

type Status = "idle" | "submitting" | "success" | "error";

export function SignupForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WaitlistInput>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { businessType: "salon" },
  });

  async function onSubmit(values: WaitlistInput) {
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
          You&apos;re on the list.
        </h3>
        <p className="text-muted text-lg leading-relaxed max-w-md mx-auto">
          Our team will reach out within 24 hours to get your storefront set up.
          We handle everything — you just show up.
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
        We set up everything for you — your storefront will be live within 48 hours of signing up.
      </div>

      <FieldShell label="Your name" htmlFor="waitlist-name" error={errors.fullName?.message}>
        <Input
          id="waitlist-name"
          autoComplete="name"
          placeholder="Priya Mehta"
          error={!!errors.fullName}
          {...register("fullName")}
        />
      </FieldShell>

      <FieldShell label="WhatsApp / Phone" htmlFor="waitlist-phone" error={errors.phone?.message}>
        <Input
          id="waitlist-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          error={!!errors.phone}
          {...register("phone")}
        />
      </FieldShell>

      <FieldShell label="Business name" htmlFor="waitlist-business" error={errors.businessName?.message}>
        <Input
          id="waitlist-business"
          autoComplete="organization"
          placeholder="Studio P Salon"
          error={!!errors.businessName}
          {...register("businessName")}
        />
      </FieldShell>

      <div className="grid sm:grid-cols-2 gap-5">
        <FieldShell label="City" htmlFor="waitlist-city" error={errors.city?.message}>
          <Input
            id="waitlist-city"
            autoComplete="address-level2"
            placeholder="Mumbai"
            error={!!errors.city}
            {...register("city")}
          />
        </FieldShell>
        <FieldShell label="Business type" htmlFor="waitlist-type" error={errors.businessType?.message}>
          <Select id="waitlist-type" error={!!errors.businessType} {...register("businessType")}>
            <option value="salon">Salon</option>
            <option value="spa">Spa / Wellness</option>
            <option value="clinic">Beauty clinic</option>
            <option value="barbershop">Barbershop</option>
            <option value="tattoo">Tattoo studio</option>
            <option value="other">Other</option>
          </Select>
        </FieldShell>
      </div>

      {errorMessage && (
        <p className="text-sm text-brand-600 font-medium" role="alert">
          {errorMessage}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting…" : "Request early access"}
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
