import type { NextRequest } from "next/server";
import { verifyBffToken } from "@/lib/verify-bff-token";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  const { id: jobId } = await params;

  try {
    const res = await fetch(`${BACKEND_API_URL}/jobs/${jobId}`, { cache: "no-store" });
    if (res.status === 404) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }
    if (!res.ok) {
      return Response.json({ error: "Backend error" }, { status: 502 });
    }
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
