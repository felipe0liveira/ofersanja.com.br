import type { NextRequest } from "next/server";
import { verifyBffToken } from "@/lib/verify-bff-token";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  const { id: jobId } = await params;

  const doc = await adminDb.collection("extraction_jobs").doc(jobId).get();

  if (!doc.exists) {
    return Response.json({ error: "Job not found" }, { status: 404 });
  }

  const data = doc.data()!;

  return Response.json({
    status: data.status,
    slug: data.slug ?? null,
    offer: data.offer ?? null,
    error: data.error ?? null,
  });
}
