import type { NextRequest } from "next/server";
import { verifyBffToken } from "@/lib/verify-bff-token";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  const snapshot = await adminDb
    .collection("extraction_jobs")
    .where("status", "==", "extracting")
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) {
    return Response.json({ jobId: null });
  }

  return Response.json({ jobId: snapshot.docs[0].id });
}
