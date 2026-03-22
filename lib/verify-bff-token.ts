import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "./firebase-admin";

export type VerifiedBffToken = {
  uid: string;
  email: string;
  roles: string[];
};

type VerifyResult =
  | { ok: true; data: VerifiedBffToken }
  | { ok: false; response: Response };

/**
 * Verifies the Bearer token and checks that the caller has at least the
 * "admin" or "manager" role in Firestore. Returns the decoded uid/email/roles
 * on success, or a ready-to-return error Response on failure.
 */
export async function verifyBffToken(request: NextRequest): Promise<VerifyResult> {
  const authorization = request.headers.get("authorization");
  const idToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!idToken) {
    return { ok: false, response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  let decoded: Awaited<ReturnType<typeof adminAuth.verifyIdToken>>;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    return {
      ok: false,
      response: Response.json({ error: "Invalid or expired token" }, { status: 401 }),
    };
  }

  const { uid, email = "" } = decoded;
  const snap = await adminDb
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();

  const roles: string[] = snap.empty ? [] : (snap.docs[0].data().roles ?? []);
  const isAuthorized = roles.includes("admin") || roles.includes("manager");

  if (!isAuthorized) {
    return {
      ok: false,
      response: Response.json(
        { error: "Acesso negado. Sua conta não tem permissão para acessar esta área." },
        { status: 403 }
      ),
    };
  }

  return { ok: true, data: { uid, email, roles } };
}
