import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.email("Enter a valid email"),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]{8,18}$/, "Enter a valid phone number"),
  businessName: z.string().min(2, "Business name is required").max(120),
  businessType: z.enum(["salon", "spa", "clinic", "barbershop", "tattoo", "other"]),
  city: z.string().min(2).max(80),
  teamSize: z.enum(["1", "2-5", "6-15", "16+"]),
});
export type SignupInput = z.infer<typeof signupSchema>;

// Early-access waitlist — no email/team size required (Glamify onboards manually)
export const waitlistSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(80),
  phone: z.string().regex(/^[0-9+\-\s()]{8,18}$/, "Enter a valid phone number"),
  businessName: z.string().min(2, "Business name is required").max(120),
  businessType: z.enum(["salon", "spa", "clinic", "barbershop", "tattoo", "other"]),
  city: z.string().min(2, "City is required").max(80),
});
export type WaitlistInput = z.infer<typeof waitlistSchema>;

export const demoSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.email(),
  phone: z.string().regex(/^[0-9+\-\s()]{8,18}$/),
  businessName: z.string().min(2).max(120),
  businessType: z.enum(["salon", "spa", "clinic", "barbershop", "tattoo", "other"]),
  city: z.string().min(2).max(80),
  teamSize: z.enum(["1", "2-5", "6-15", "16+"]),
  message: z.string().max(800).optional(),
});
export type DemoInput = z.infer<typeof demoSchema>;

export const contactSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.email(),
  topic: z.enum(["sales", "support", "partnership", "press", "other"]),
  message: z.string().min(10, "Tell us a little more").max(1500),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const leadSourceSchema = z.object({
  source: z.string(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});
