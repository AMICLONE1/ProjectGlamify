import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, ok } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    include: {
      tenant: { select: { id: true, name: true, slug: true, plan: true, businessType: true } },
      staffDetail: { select: { locationId: true, speciality: true, isBookable: true } },
    },
  });

  if (!user) return Response.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, { status: 404 });

  return ok({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl,
    tenantId: user.tenantId,
    tenant: user.tenant,
    staffDetail: user.staffDetail,
  });
}
