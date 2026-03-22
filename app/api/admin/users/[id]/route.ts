import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyBffToken } from "@/lib/verify-bff-token";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  if (!auth.data.roles.includes("admin")) {
    return Response.json(
      { error: "Apenas administradores podem editar usuários." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const roles: string[] = Array.isArray(body?.roles) ? body.roles : [];

  await adminDb.collection("users").doc(id).update({ roles });

  return Response.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  if (!auth.data.roles.includes("admin")) {
    return Response.json(
      { error: "Apenas administradores podem remover usuários." },
      { status: 403 }
    );
  }

  const { id } = await params;
  await adminDb.collection("users").doc(id).delete();

  return Response.json({ success: true });
}
