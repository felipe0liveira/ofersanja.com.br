import type { NextRequest } from "next/server";
import { verifyBffToken } from "@/lib/verify-bff-token";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

export async function GET(request: NextRequest) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  try {
    const res = await fetch(
      `${BACKEND_API_URL}/offers/?extractedAfterCopy=${todayStart.toISOString()}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return Response.json({ error: "Backend error" }, { status: 502 });
    }
    const body = await res.json();
    const offers = Array.isArray(body) ? body : (body.data ?? []);
    return Response.json({ offers, pagination: body.pagination ?? null });
  } catch {
    return Response.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
