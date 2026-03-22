import type { NextRequest } from "next/server";
import { verifyBffToken } from "@/lib/verify-bff-token";

export async function GET(request: NextRequest) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  return Response.json({ email: auth.data.email, roles: auth.data.roles });
}
