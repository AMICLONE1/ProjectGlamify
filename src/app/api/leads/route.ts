import { NextResponse } from "next/server";
import { signupSchema, demoSchema, contactSchema, waitlistSchema } from "@/lib/schemas";
import { db } from "@/lib/db";

const schemas = {
  signup: signupSchema,
  waitlist: waitlistSchema,
  demo: demoSchema,
  contact: contactSchema,
} as const;

type LeadKind = keyof typeof schemas;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "Body must be JSON" } },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_BODY", message: "Body required" } },
      { status: 400 }
    );
  }

  const { kind, payload } = body as { kind?: LeadKind; payload?: unknown };

  if (!kind || !(kind in schemas)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_KIND", message: "kind must be signup|waitlist|demo|contact" },
      },
      { status: 400 }
    );
  }

  const schema = schemas[kind];
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid payload",
          issues: parsed.error.issues,
        },
      },
      { status: 422 }
    );
  }

  const d = parsed.data as Record<string, string | undefined>;

  await db.lead.create({
    data: {
      kind,
      fullName:     d.fullName     ?? "",
      phone:        d.phone        ?? null,
      email:        d.email        ?? null,
      businessName: d.businessName ?? null,
      businessType: d.businessType ?? null,
      city:         d.city         ?? null,
      teamSize:     d.teamSize     ?? null,
      message:      d.message      ?? null,
      topic:        d.topic        ?? null,
    },
  });

  return NextResponse.json({ success: true, data: { received: true } }, { status: 201 });
}
