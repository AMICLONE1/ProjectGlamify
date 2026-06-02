import jwt from "jsonwebtoken";
import { db } from "./db";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
const JWT_EXPIRES = "7d";

export interface TokenPayload {
  sub: string;       // userId
  tenantId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<TokenPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function extractBearer(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export async function requireAuth(request: Request): Promise<{
  userId: string;
  tenantId: string;
  role: string;
} | Response> {
  const token = extractBearer(request);
  if (!token) {
    return Response.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Missing token" } },
      { status: 401 }
    );
  }
  try {
    const payload = verifyToken(token);
    return { userId: payload.sub, tenantId: payload.tenantId, role: payload.role };
  } catch {
    return Response.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } },
      { status: 401 }
    );
  }
}

export function ok<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status });
}

export function fail(code: string, message: string, status: number): Response {
  return Response.json({ success: false, error: { code, message } }, { status });
}

export async function writeAudit(
  tenantId: string,
  userId: string | null,
  action: string,
  resource: string,
  resourceId?: string,
  diff?: unknown
) {
  await db.auditLog.create({
    data: { tenantId, userId, action, resource, resourceId, diff: diff as never },
  });
}
