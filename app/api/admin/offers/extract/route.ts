import type { NextRequest } from "next/server";
import { verifyBffToken } from "@/lib/verify-bff-token";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;

export async function POST(request: NextRequest) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  let url: string;
  try {
    const body = await request.json();
    url = body?.url;
    if (typeof url !== "string" || !url) throw new Error("Missing url");
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_API_URL}/offers/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) {
      return Response.json({ error: data?.error ?? "Backend error" }, { status: res.status });
    }
    // Backend returns { job_id, slug } — normalize to camelCase for the client
    return Response.json({ jobId: data.job_id, slug: data.slug }, { status: 202 });
  } catch {
    return Response.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}

