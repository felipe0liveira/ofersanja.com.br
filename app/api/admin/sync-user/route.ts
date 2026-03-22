import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  let idToken: string;

  try {
    const body = await request.json();
    idToken = body.idToken;
    if (!idToken) throw new Error("Missing idToken");
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    return Response.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const { uid, name, email, picture } = decoded;

  // Authorization: user must exist in Firestore with role "admin" or "manager"
  const usersQuery = await adminDb
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();

  const userDoc = usersQuery.empty ? null : usersQuery.docs[0];
  const roles: string[] = userDoc?.data().roles ?? [];
  const isAuthorized = roles.includes("admin") || roles.includes("manager");

  if (!isAuthorized) {
    return Response.json(
      { error: "Acesso negado. Sua conta não tem permissão para acessar esta área." },
      { status: 403 }
    );
  }

  await adminDb
    .collection("users")
    .doc(uid)
    .set(
      {
        name: name ?? null,
        email: email ?? null,
        photo: picture ?? null,
        lastLoginAt: new Date(),
      },
      { merge: true }
    );

  return Response.json({ success: true });
}
