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

  // Read the offer from offers/{slug} — the source of truth.
  // The job doc never stores a copy of the offer.
  let offer: Record<string, unknown> | null = null;
  if ((data.status === "done" || data.status === "conflict") && data.slug) {
    const offerDoc = await adminDb.collection("offers").doc(data.slug).get();
    if (offerDoc.exists) {
      const o = offerDoc.data()!;
      const toIso = (v: unknown) =>
        v && typeof (v as { toDate?: () => Date }).toDate === "function"
          ? (v as { toDate: () => Date }).toDate().toISOString()
          : (v ?? null);
      offer = {
        id: data.slug,
        ...o,
        scrapped_at: toIso(o.scrapped_at),
        dispatched_at: toIso(o.dispatched_at),
        expiration_datetime: toIso(o.expiration_datetime),
      };
    }
  }

  return Response.json({
    status: data.status,
    slug: data.slug ?? null,
    offer,
    error: data.error ?? null,
  });
}
