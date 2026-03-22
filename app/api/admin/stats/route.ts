import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyBffToken } from "@/lib/verify-bff-token";

export async function GET(request: NextRequest) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const snapshot = await adminDb
    .collection("offers")
    .where("scrapped_at", ">=", todayStart)
    .get();

  const totalToday = snapshot.size;
  const dispatchedToday = snapshot.docs.filter((doc) => doc.data().dispatched_at).length;

  return Response.json({ totalToday, dispatchedToday });
}
