"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/schemas";
import { FieldShell, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/track";

type Status = "idle" | "submitting" | "success" | "error";

export function SignupForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { businessType: "salon", teamSize: "1" },
  });

  async function onSubmit(values: SignupInput) {
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "signup", payload: values }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "Signup failed");
      }
      track("signup_submitted", {
        businessType: values.businessType,
        teamSize: values.teamSize,
        city: values.city,
      });
      setStatus("success");
      reset();
    } catch (err) {
      track("signup_failed", { reason: err instanceof Error ? err.message : "unknown" });
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-brand-500 bg-brand-50 p-10 text-center">
        <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-brand-500 grid place-items-center text-white text-3xl font-bold">✓</div>
        <h3 className="font-display text-3xl font-extrabold uppercase tracking-tight text-ink mb-3">You&apos;re in.</h3>
        <p className="text-muted text-lg leading-relaxed max-w-md mx-auto">
          We&apos;ve sent a magic link to your inbox. Click it to finish setting up your
          Glamify account.
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
      <div className="grid sm:grid-cols-2 gap-5">
        <FieldShell label="Your name" htmlFor="signup-name" error={errors.fullName?.message}>
          <Input
            id="signup-name"
            autoComplete="name"
            placeholder="Priya Mehta"
            error={!!errors.fullName}
            {...register("fullName")}
          />
        </FieldShell>
        <FieldShell label="Email" htmlFor="signup-email" error={errors.email?.message}>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@yourbusiness.com"
            error={!!errors.email}
            {...register("email")}
          />
        </FieldShell>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <FieldShell label="Phone" htmlFor="signup-phone" error={errors.phone?.message}>
          <Input
            id="signup-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            error={!!errors.phone}
            {...register("phone")}
          />
        </FieldShell>
        <FieldShell label="City" htmlFor="signup-city" error={errors.city?.message}>
          <Input
            id="signup-city"
            autoComplete="address-level2"
            placeholder="Mumbai"
            error={!!errors.city}
            {...register("city")}
          />
        </FieldShell>
      </div>

      <FieldShell
        label="Business name"
        htmlFor="signup-business"
        error={errors.businessName?.message}
      >
        <Input
          id="signup-business"
          autoComplete="organization"
          placeholder="Studio P Salon"
          error={!!errors.businessName}
          {...register("businessName")}
        />
      </FieldShell>

      <div className="grid sm:grid-cols-2 gap-5">
        <FieldShell
          label="Business type"
          htmlFor="signup-type"
          error={errors.businessType?.message}
        >
          <Select id="signup-type" error={!!errors.businessType} {...register("businessType")}>
            <option value="salon">Salon</option>
            <option value="spa">Spa / Wellness</option>
            <option value="clinic">Beauty clinic</option>
            <option value="barbershop">Barbershop</option>
            <option value="tattoo">Tattoo studio</option>
            <option value="other">Other</option>
          </Select>
        </FieldShell>
        <FieldShell label="Team size" htmlFor="signup-team" error={errors.teamSize?.message}>
          <Select id="signup-team" error={!!errors.teamSize} {...register("teamSize")}>
            <option value="1">Just me</option>
            <option value="2-5">2 – 5</option>
            <option value="6-15">6 – 15</option>
            <option value="16+">16+</option>
          </Select>
        </FieldShell>
      </div>

      {errorMessage && (
        <p className="text-sm text-brand-600 font-medium" role="alert">
          {errorMessage}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" ? "Creating your account…" : "Start free"}
        {status !== "submitting" && <span aria-hidden>→</span>}
      </Button>

      <p className="text-xs text-muted/80 text-center leading-relaxed">
        Free forever for solo professionals. No card required. By signing up you agree to our{" "}
        <a
          href="/terms"
          className="underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Terms
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          className="underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Privacy policy
        </a>
        .
      </p>
    </form>
  );
}
