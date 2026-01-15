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
      <div className="p-4 text-xs text-destructive font-mono">
        خطأ: فشل الجلب
      </div>
    );

  const stats = data || { orders: 0, products: 0, customers: 0, revenue: 0 };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={<DollarSign size={18} />}
        label="إجمالي الإيرادات"
        value={stats.revenue}
        isCurrency={true}
        color="text-amber-600 dark:text-amber-400"
        bg="bg-amber-50 dark:bg-amber-900/20"
        loading={isLoading && !data}
      />
      <MetricCard
        icon={<Package size={18} />}
        label="الأصول الرقمية"
        value={stats.products}
        color="text-primary"
        bg="bg-primary/10"
        loading={isLoading && !data}
      />
      <MetricCard
        icon={<ShoppingCart size={18} />}
        label="إجمالي الطلبات"
        value={stats.orders}
        color="text-emerald-600 dark:text-emerald-400"
        bg="bg-emerald-50 dark:bg-emerald-900/20"
        loading={isLoading && !data}
      />
      <MetricCard
        icon={<Users size={18} />}
        label="العملاء النشطين"
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
    <div className="flex items-center gap-4 p-3 border-b sm:border-b-0 sm:border-r border-border last:border-0">
      <div
        className={`p-3 rounded-xl transition-all duration-300 ${bg} ${color}`}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] truncate">
          {label}
        </p>
        <h4
          className={`text-xl font-black text-foreground font-mono tracking-tighter transition-opacity ${loading ? "opacity-30" : "opacity-100"}`}
        >
          {formattedValue}
        </h4>
      </div>
    </div>
  );
}
