"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Send, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useAdminAuth } from "../_hooks/useAdminAuth";
import { AdminHeader } from "../_components/AdminHeader";

type Stats = {
  totalToday: number;
  dispatchedToday: number;
};

function StatCard({
  icon,
  label,
  value,
  loading,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  loading: boolean;
  href?: string;
}) {
  const content = (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-5 hover:shadow-sm transition-shadow">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-950">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-0.5">{label}</p>
        {loading ? (
          <div className="h-8 w-12 bg-gray-100 rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

export default function DashboardPage() {
  const { user, idToken, roles, checking } = useAdminAuth();
  const [stats, setStats] = useState<Stats>({ totalToday: 0, dispatchedToday: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idToken) return;
    setLoading(true);
    fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${idToken}` },
    })
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }, [idToken]);

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

      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-6">
          <LayoutDashboard className="w-5 h-5 text-blue-950" />
          <h2 className="text-lg font-bold text-gray-800">Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <StatCard
            icon={<ShoppingBag className="w-6 h-6" />}
            label="Ofertas hoje"
            value={stats.totalToday}
            loading={loading}
            href="/admin/offers"
          />
          <StatCard
            icon={<Send className="w-6 h-6" />}
            label="Disparadas hoje"
            value={stats.dispatchedToday}
            loading={loading}
            href="/admin/offers"
          />
        </div>
      </main>
    </div>
  );
}

