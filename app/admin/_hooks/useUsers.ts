"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminUser } from "@/lib/types/admin-user";

export function useUsers(idToken: string) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

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

  const handleAdd = useCallback(
    async (email: string, roles: string[]): Promise<boolean> => {
      setAddError(null);
      setAddLoading(true);
      try {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ email, roles }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAddError(data.error ?? "Erro ao criar usuário.");
          return false;
        }
        setUsers((prev) => [
          ...prev,
          {
            id: data.id,
            uid: null,
            email: email.trim().toLowerCase(),
            name: null,
            photo: null,
            roles,
            lastLoginAt: null,
          },
        ]);
        return true;
      } finally {
        setAddLoading(false);
      }
    },
    [idToken]
  );

  const handleSaveRoles = useCallback(
    async (id: string, roles: string[]) => {
      await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ roles }),
      });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, roles } : u)));
    },
    [idToken]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    },
    [idToken]
  );

  return {
    users,
    loading,
    addLoading,
    addError,
    setAddError,
    handleAdd,
    handleSaveRoles,
    handleDelete,
  };
}
