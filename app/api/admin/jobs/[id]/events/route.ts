import type { NextRequest } from "next/server";
import { verifyBffToken } from "@/lib/verify-bff-token";
import { getBackendToken } from "@/lib/get-backend-token";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  if (!auth.data.roles.includes("admin")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: jobId } = await params;

  try {
    const token = await getBackendToken(BACKEND_API_URL);
    const res = await fetch(`${BACKEND_API_URL}/jobs/${jobId}/events`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return Response.json({ error: "Backend error" }, { status: res.status });
    }
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
