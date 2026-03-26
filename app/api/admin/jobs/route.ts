import type { NextRequest } from "next/server";
import { verifyBffToken } from "@/lib/verify-bff-token";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

export async function GET(request: NextRequest) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  if (!auth.data.roles.includes("admin")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const res = await fetch(`${BACKEND_API_URL}/jobs/`, { cache: "no-store" });
    if (!res.ok) {
      return Response.json({ error: "Backend error" }, { status: 502 });
    }
    const jobs = await res.json();
    return Response.json({ jobs });
  } catch {
    return Response.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
