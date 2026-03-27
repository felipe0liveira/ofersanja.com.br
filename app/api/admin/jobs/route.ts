import type { NextRequest } from "next/server";
import { verifyBffToken } from "@/lib/verify-bff-token";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

export async function GET(request: NextRequest) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  if (!auth.data.roles.includes("admin")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const backendUrl = new URL(`${BACKEND_API_URL}/jobs/`);
  if (searchParams.has("page")) backendUrl.searchParams.set("page", searchParams.get("page")!);
  if (searchParams.has("limit")) backendUrl.searchParams.set("limit", searchParams.get("limit")!);

  try {
    const res = await fetch(backendUrl.toString(), { cache: "no-store" });
    if (!res.ok) {
      return Response.json({ error: "Backend error" }, { status: 502 });
    }
    const body = await res.json();
    const jobs = Array.isArray(body) ? body : (body.data ?? []);
    return Response.json({ jobs, pagination: body.pagination ?? null });
  } catch {
    return Response.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
