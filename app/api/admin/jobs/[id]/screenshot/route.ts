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
    const res = await fetch(`${BACKEND_API_URL}/jobs/${jobId}/screenshot`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return Response.json({ error: "Screenshot not available" }, { status: res.status });
    }
    const contentType = res.headers.get("content-type") ?? "image/png";
    const buffer = await res.arrayBuffer();
    return new Response(buffer, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  } catch {
    return Response.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
