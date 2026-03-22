import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorization = request.headers.get("authorization");
  const idToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!idToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decodedToken: Awaited<ReturnType<typeof adminAuth.verifyIdToken>>;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch {
    return Response.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const { id } = await params;

  await adminDb
    .collection("offers")
    .doc(id)
    .update({
      dispatched_at: new Date(),
      updated_by: {
        uid: decodedToken.uid,
        email: decodedToken.email ?? null,
        name: decodedToken.name ?? null,
      },
    });

  return Response.json({ success: true });
}
