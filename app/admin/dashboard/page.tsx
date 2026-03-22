"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import Image from "next/image";
import { auth } from "@/lib/firebase";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        window.location.href = "/admin";
        return;
      }
      setUser(currentUser);
      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-gray-400 text-sm">Verificando acesso...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <span className="font-bold text-gray-800">Ofersanja Admin</span>
        <div className="flex items-center gap-3">
          {user?.photoURL && (
            <Image
              src={user.photoURL}
              alt={user.displayName ?? "Avatar"}
              width={32}
              height={32}
              className="rounded-full ring-2 ring-gray-200"
            />
          )}
          <span className="text-sm text-gray-600 hidden sm:block">{user?.displayName}</span>
          <button
            onClick={() => signOut(auth).then(() => { window.location.href = "/admin"; })}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Bem-vindo, {user?.displayName?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500">O dashboard está pronto para receber conteúdo.</p>
        </div>
      </main>
    </div>
  );
}
