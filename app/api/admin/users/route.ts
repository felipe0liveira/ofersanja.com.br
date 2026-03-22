import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyBffToken } from "@/lib/verify-bff-token";
import type { AdminUser } from "@/lib/types/admin-user";

export async function GET(request: NextRequest) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  const snap = await adminDb.collection("users").orderBy("email").get();

  const users: AdminUser[] = snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      uid: d.uid ?? null,
      email: d.email,
      name: d.name ?? null,
      photo: d.photo ?? null,
      roles: d.roles ?? [],
      lastLoginAt: d.lastLoginAt?.toDate().toISOString() ?? null,
    };
  });

  return Response.json({ users });
}

export async function POST(request: NextRequest) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  if (!auth.data.roles.includes("admin")) {
    return Response.json(
      { error: "Apenas administradores podem criar usuários." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const email: string = body?.email?.trim().toLowerCase() ?? "";
  const roles: string[] = Array.isArray(body?.roles) ? body.roles : [];

  if (!email) {
    return Response.json({ error: "Email é obrigatório." }, { status: 400 });
  }

  const existing = await adminDb
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();

  if (!existing.empty) {
    return Response.json(
      { error: "Já existe um usuário com este email." },
      { status: 409 }
    );
  }

  const ref = await adminDb.collection("users").add({
    email,
    roles,
    uid: null,
    name: null,
    photo: null,
    lastLoginAt: null,
    created_at: new Date(),
  });

  return Response.json({ id: ref.id, email, roles }, { status: 201 });
}
