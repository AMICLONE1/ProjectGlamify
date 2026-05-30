"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/schemas";
import { FieldShell, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/track";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { topic: "sales" },
  });

  async function onSubmit(values: ContactInput) {
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "contact", payload: values }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "Submission failed");
      }
      track("contact_submitted", { topic: values.topic });
      setStatus("success");
      reset();
    } catch (err) {
      track("contact_failed", { reason: err instanceof Error ? err.message : "unknown" });
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-brand-500 bg-brand-50 p-8 text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-brand-500 grid place-items-center text-white text-2xl font-bold">✓</div>
        <h3 className="font-display text-2xl font-bold text-ink mb-2 uppercase tracking-tight">Got it.</h3>
        <p className="text-muted">
          We&apos;ll reply within one business day. Promise.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl border border-border bg-surface p-7"
      noValidate
    >
      <FieldShell label="Your name" htmlFor="contact-name" error={errors.fullName?.message}>
        <Input
          id="contact-name"
          autoComplete="name"
          placeholder="Priya Mehta"
          error={!!errors.fullName}
          {...register("fullName")}
        />
      </FieldShell>

      <FieldShell label="Email" htmlFor="contact-email" error={errors.email?.message}>
        <Input
          id="contact-email"
          type="email"
          autoComplete="email"
          placeholder="you@yourbusiness.com"
          error={!!errors.email}
          {...register("email")}
        />
      </FieldShell>

      <FieldShell label="Topic" htmlFor="contact-topic" error={errors.topic?.message}>
        <Select id="contact-topic" error={!!errors.topic} {...register("topic")}>
          <option value="sales">Sales / Enterprise pricing</option>
          <option value="support">Support (existing customer)</option>
          <option value="partnership">Partnership</option>
          <option value="press">Press & media</option>
          <option value="other">Something else</option>
        </Select>
      </FieldShell>

      <FieldShell label="Message" htmlFor="contact-message" error={errors.message?.message}>
        <Textarea
          id="contact-message"
          placeholder="Tell us a little about what you're looking for…"
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
        {status === "submitting" ? "Sending…" : "Send message"}
        {status !== "submitting" && <span aria-hidden>→</span>}
      </Button>

      <p className="text-xs text-muted/80 text-center">
        We&apos;ll never share your details. See our{" "}
        <a
          href="/privacy"
          className="underline underline-offset-4 hover:text-foreground transition-colors"
        >
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
