"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, type User } from "firebase/auth";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";

export function AdminHeader({ user, roles }: { user: User; roles: string[] }) {
  const pathname = usePathname();
  const isAdmin = roles.includes("admin");

  function navClass(href: string) {
    return `text-sm transition-colors ${
      pathname === href
        ? "font-semibold text-blue-950"
        : "text-gray-500 hover:text-gray-800"
    }`;
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center gap-6">
        <span className="font-bold text-gray-800">Ofersanja Admin</span>
        <nav className="flex items-center gap-4">
          <Link href="/admin/dashboard" className={navClass("/admin/dashboard")}>
            Ofertas
          </Link>
          {isAdmin && (
            <Link href="/admin/users" className={navClass("/admin/users")}>
              Usuários
            </Link>
          )}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {user.photoURL && (
          <Image
            src={user.photoURL}
            alt={user.displayName ?? "Avatar"}
            width={32}
            height={32}
            className="rounded-full ring-2 ring-gray-200"
          />
        )}
        <span className="text-sm text-gray-600 hidden sm:block">{user.displayName}</span>
        <button
          onClick={() =>
            signOut(auth).then(() => {
              window.location.href = "/admin";
            })
          }
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
