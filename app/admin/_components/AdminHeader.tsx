"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, type User } from "firebase/auth";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOut, LayoutDashboard, ShoppingBag, Users, BriefcaseBusiness } from "lucide-react";
import { auth } from "@/lib/firebase";

export function AdminHeader({ user, roles }: { user: User; roles: string[] }) {
  const pathname = usePathname();
  const isAdmin = roles.includes("admin");
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmSignOut(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
    setConfirmSignOut(false);
  }, [pathname]);

  function navClass(href: string) {
    return `text-sm transition-colors ${
      pathname === href
        ? "font-semibold text-blue-950"
        : "text-gray-500 hover:text-gray-800"
    }`;
  }

  function menuLinkClass(href: string) {
    return `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded-xl ${
      pathname === href
        ? "bg-blue-50 text-blue-950 font-semibold"
        : "text-gray-700 hover:bg-gray-50"
    }`;
  }

  async function handleSignOut() {
    await signOut(auth);
    window.location.href = "/admin";
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      {/* Logo + desktop nav */}
      <div className="flex items-center gap-6">
        <span className="font-bold text-gray-800">Ofersanja Admin</span>
        <nav className="hidden sm:flex items-center gap-4">
          <Link href="/admin/dashboard" className={navClass("/admin/dashboard")}>
            Início
          </Link>
          <Link href="/admin/offers" className={navClass("/admin/offers")}>
            Ofertas
          </Link>
          {isAdmin && (
            <Link href="/admin/users" className={navClass("/admin/users")}>
              Usuários
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin/jobs" className={navClass("/admin/jobs")}>
              Jobs
            </Link>
          )}
        </nav>
      </div>

      {/* Avatar trigger */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => { setMenuOpen((v) => !v); setConfirmSignOut(false); }}
          className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-950"
          aria-label="Menu do usuário"
        >
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName ?? "Avatar"}
              width={36}
              height={36}
              className="rounded-full ring-2 ring-gray-200 hover:ring-blue-300 transition-all"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-950 text-white flex items-center justify-center text-sm font-bold">
              {user.displayName?.[0] ?? user.email?.[0] ?? "?"}
            </div>
          )}
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-lg border border-gray-100 p-2 z-50">
            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-100 mb-1">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.displayName}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>

            {/* Mobile-only nav links */}
            <div className="sm:hidden mb-1 pb-1 border-b border-gray-100">
              <Link href="/admin/dashboard" className={menuLinkClass("/admin/dashboard")}>
                <LayoutDashboard className="w-4 h-4" /> Início
              </Link>
              <Link href="/admin/offers" className={menuLinkClass("/admin/offers")}>
                <ShoppingBag className="w-4 h-4" /> Ofertas
              </Link>
              {isAdmin && (
                <Link href="/admin/users" className={menuLinkClass("/admin/users")}>
                  <Users className="w-4 h-4" /> Usuários
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin/jobs" className={menuLinkClass("/admin/jobs")}>
                  <BriefcaseBusiness className="w-4 h-4" /> Jobs
                </Link>
              )}
            </div>

            {/* Sign out */}
            {confirmSignOut ? (
              <div className="px-4 py-2.5">
                <p className="text-sm text-gray-700 mb-3">Tem certeza que deseja sair?</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSignOut}
                    className="flex-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl py-2 transition-colors font-medium"
                  >
                    Sair
                  </button>
                  <button
                    onClick={() => setConfirmSignOut(false)}
                    className="flex-1 text-sm border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl py-2 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmSignOut(true)}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
