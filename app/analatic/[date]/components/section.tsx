"use client";

import React from "react";
import useSWR from "swr";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Loader2,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SectionCards() {
  const { data, error, isLoading } = useSWR("/api/stats", fetcher, {
    refreshInterval: 60000,
  });

  if (error)
    return (
      <div className="p-4 text-xs text-red-500 font-mono">
        ERR: FETCH_FAILED
      </div>
    );

  const stats = data || { orders: 0, products: 0, customers: 0, revenue: 0 };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={<DollarSign size={18} />}
        label="Total Revenue"
        value={stats.revenue}
        isCurrency={true}
        color="text-amber-600 dark:text-amber-400"
        bg="bg-amber-50 dark:bg-amber-900/20"
        loading={isLoading && !data}
      />
      <MetricCard
        icon={<Package size={18} />}
        label="Digital Assets"
        value={stats.products}
        color="text-blue-600 dark:text-blue-400"
        bg="bg-blue-50 dark:bg-blue-900/20"
        loading={isLoading && !data}
      />
      <MetricCard
        icon={<ShoppingCart size={18} />}
        label="Total Orders"
        value={stats.orders}
        color="text-emerald-600 dark:text-emerald-400"
        bg="bg-emerald-50 dark:bg-emerald-900/20"
        loading={isLoading && !data}
      />
      <MetricCard
        icon={<Users size={18} />}
        label="Active Customers"
        value={stats.customers}
        color="text-violet-600 dark:text-violet-400"
        bg="bg-violet-50 dark:bg-violet-900/20"
        loading={isLoading && !data}
      />
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
  bg,
  loading,
  isCurrency,
}: any) {
  const formattedValue = isCurrency
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    : value
      ? value.toLocaleString()
      : 0;

  return (
    <div className="flex items-center gap-4 p-3 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 last:border-0">
      <div
        className={`p-3 rounded-xl transition-all duration-300 ${bg} ${color}`}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] truncate">
          {label}
        </p>
        <h4
          className={`text-xl font-black text-slate-800 dark:text-white font-mono tracking-tighter transition-opacity ${loading ? "opacity-30" : "opacity-100"}`}
        >
          {formattedValue}
        </h4>
      </div>
    </div>
  );
}
