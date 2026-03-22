"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Users, Plus, Trash2, Check, X, Edit2 } from "lucide-react";
import { useAdminAuth } from "../_hooks/useAdminAuth";
import { AdminHeader } from "../_components/AdminHeader";
import type { AdminUser } from "@/lib/types/admin-user";

const ALL_ROLES = ["admin", "manager"] as const;

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        role === "admin"
          ? "bg-blue-100 text-blue-800"
          : "bg-purple-100 text-purple-800"
      }`}
    >
      {role}
    </span>
  );
}

export default function UsersPage() {
  const { user, idToken, roles, checking } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRoles, setNewRoles] = useState<string[]>(["manager"]);
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isAdmin = roles.includes("admin");

  useEffect(() => {
    if (!idToken) return;
    setLoading(true);
    fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${idToken}` },
    })
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .finally(() => setLoading(false));
  }, [idToken]);

  async function handleAdd() {
    setAddError(null);
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email: newEmail, roles: newRoles }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error ?? "Erro ao criar usuário.");
        return;
      }
      setUsers((prev) => [
        ...prev,
        {
          id: data.id,
          uid: null,
          email: newEmail.trim().toLowerCase(),
          name: null,
          photo: null,
          roles: newRoles,
          lastLoginAt: null,
        },
      ]);
      setNewEmail("");
      setNewRoles(["manager"]);
      setShowAdd(false);
    } finally {
      setAddLoading(false);
    }
  }

  async function handleSaveRoles(id: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ roles: editRoles }),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, roles: editRoles } : u))
    );
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleteConfirmId(null);
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-gray-400 text-sm">Verificando acesso...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader user={user!} roles={roles} />

      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-950" />
            <h2 className="text-lg font-bold text-gray-800">Usuários</h2>
            {!loading && (
              <span className="text-sm text-gray-400">({users.length})</span>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setShowAdd((v) => !v);
                setAddError(null);
              }}
              className="flex items-center gap-2 text-sm bg-blue-950 hover:bg-blue-900 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar usuário
            </button>
          )}
        </div>

        {showAdd && isAdmin && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Novo usuário</h3>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                type="email"
                placeholder="email@exemplo.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950"
              />
              <div className="flex items-center gap-4">
                {ALL_ROLES.map((r) => (
                  <label key={r} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRoles.includes(r)}
                      onChange={(e) =>
                        setNewRoles((prev) =>
                          e.target.checked ? [...prev, r] : prev.filter((x) => x !== r)
                        )
                      }
                      className="rounded"
                    />
                    {r}
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdd}
                  disabled={addLoading || !newEmail.trim()}
                  className="flex items-center gap-1.5 text-sm bg-blue-950 hover:bg-blue-900 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  {addLoading ? "Salvando..." : "Salvar"}
                </button>
                <button
                  onClick={() => {
                    setShowAdd(false);
                    setAddError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {addError && <p className="text-sm text-red-500 mt-3">{addError}</p>}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 h-16 animate-pulse"
              />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left font-medium text-gray-500 px-5 py-3">Usuário</th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3">Roles</th>
                  <th className="text-left font-medium text-gray-500 px-5 py-3 hidden sm:table-cell">
                    Último login
                  </th>
                  {isAdmin && <th className="px-5 py-3 w-24" />}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {u.photo ? (
                          <Image
                            src={u.photo}
                            alt={u.name ?? u.email}
                            width={32}
                            height={32}
                            className="rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold flex-shrink-0">
                            {u.email[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          {u.name && (
                            <p className="font-medium text-gray-800 truncate">{u.name}</p>
                          )}
                          <p className="text-gray-500 text-xs truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {editingId === u.id ? (
                        <div className="flex items-center gap-3">
                          {ALL_ROLES.map((r) => (
                            <label
                              key={r}
                              className="flex items-center gap-1 text-xs cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={editRoles.includes(r)}
                                onChange={(e) =>
                                  setEditRoles((prev) =>
                                    e.target.checked
                                      ? [...prev, r]
                                      : prev.filter((x) => x !== r)
                                  )
                                }
                              />
                              {r}
                            </label>
                          ))}
                          <button
                            onClick={() => handleSaveRoles(u.id)}
                            className="text-green-600 hover:text-green-700 ml-1"
                            title="Salvar"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 flex-wrap">
                          {u.roles.length === 0 ? (
                            <span className="text-gray-400 text-xs">—</span>
                          ) : (
                            u.roles.map((r) => <RoleBadge key={r} role={r} />)
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs hidden sm:table-cell">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleString("pt-BR")
                        : "Nunca"}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          {deleteConfirmId === u.id ? (
                            <>
                              <button
                                onClick={() => handleDelete(u.id)}
                                className="text-xs text-red-600 font-medium hover:underline"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-xs text-gray-400 hover:text-gray-600"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(u.id);
                                  setEditRoles(u.roles);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Editar roles"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(u.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="Remover usuário"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
