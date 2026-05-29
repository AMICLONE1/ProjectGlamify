import { NextResponse } from "next/server";
import { signupSchema, demoSchema, contactSchema } from "@/lib/schemas";

const schemas = {
  signup: signupSchema,
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
        error: { code: "INVALID_KIND", message: "kind must be signup|demo|contact" },
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

  // TODO(week-4): insert into Supabase `leads` table
  console.log(`[lead:${kind}]`, parsed.data);

  return NextResponse.json({ success: true, data: { received: true } }, { status: 201 });
}
