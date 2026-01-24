"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  XCircle,
  ArrowUpDown,
  Clock,
  DollarSign,
  Trash2,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function CancelledOrdersList({ orders }: { orders: any[] }) {
  const [sortBy, setSortBy] = useState<"date" | "price">("date");

  const sortedOrders = useMemo(() => {
    const list = [...orders];

    if (sortBy === "price") {
      return list.sort((a, b) => b.totalAmount - a.totalAmount);
    }

    return list.sort((a, b) => {
      const dateA = a.createdAt || 0;
      const dateB = b.createdAt || 0;
      return dateB - dateA;
    });
  }, [orders, sortBy]);

  const onDelete = (orderId: string) => {
    console.log(`Deleting order: ${orderId}`);
    // Implement actual deletion logic here
  };

  const formatDateArabic = (date: any) => {
    if (!date) return "";
    let d: Date;
    if (date && typeof date.toDate === "function") {
      d = date.toDate();
    } else if (typeof date === "string" || typeof date === "number") {
      d = new Date(date);
    } else if (date instanceof Date) {
      d = date;
    } else {
      return "";
    }

    if (isNaN(d.getTime())) return "";

    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-destructive/10 rounded-lg text-destructive">
            <ArrowUpDown size={14} />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
            الطلبات الملغية
          </span>
        </div>

        <div className="flex bg-muted p-1 rounded-xl border border-border">
          <button
            onClick={() => setSortBy("date")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-black uppercase rounded-lg transition-all",
              sortBy === "date"
                ? "bg-card text-destructive shadow-sm"
                : "text-muted-foreground hover:text-destructive",
            )}
          >
            <Clock size={10} />
            الحديثة
          </button>
          <button
            onClick={() => setSortBy("price")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-black uppercase rounded-lg transition-all",
              sortBy === "price"
                ? "bg-card text-destructive shadow-sm"
                : "text-muted-foreground hover:text-destructive",
            )}
          >
            <DollarSign size={10} />
            القيمة
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        {sortedOrders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border-2 border-dashed border-border">
            <XCircle size={40} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.3em]">
              لا توجد طلبات ملغية
            </p>
          </div>
        ) : (
          sortedOrders.map((order: any) => (
            <Link
              href={`/manageOrder/${order.id}` as any}
              key={order.id}
              className="bg-card border border-border rounded-xl p-3 shadow-sm flex items-center justify-between group hover:border-destructive/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="bg-destructive/10 text-destructive p-2 rounded-xl group-hover:bg-destructive group-hover:text-destructive-foreground transition-all">
                  <XCircle size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="bg-destructive/10 text-destructive text-sm font-black uppercase tracking-widest px-2 py-0.5 rounded border border-destructive/20">
                      ملغي
                    </span>
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      {formatDateArabic(order.createdAt)}
                    </span>
                  </div>
                  <p className="font-bold text-foreground leading-none mb-1 text-sm group-hover:text-destructive transition-colors">
                    {order.customer_email ||
                      order.customer_name ||
                      "عميل غير معروف"}
                  </p>
                  <p className="text-xs text-muted-foreground font-black tracking-tight uppercase">
                    المرجع: {order.id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-base font-black text-foreground leading-none mb-1 transition-colors">
                  {order.totalAmount.toLocaleString()}{" "}
                  <span className="text-xs text-muted-foreground">ج.س</span>
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-black justify-end uppercase tracking-widest mt-1">
                  <Calendar size={10} />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault(); // Prevent navigation
                    onDelete(order.id);
                  }}
                  className="w-full mt-3 flex items-center justify-center gap-2 bg-muted hover:bg-destructive hover:text-destructive-foreground text-muted-foreground py-2 rounded-lg text-sm font-black uppercase tracking-widest transition-all"
                >
                  <Trash2 size={14} />
                  حذف السجل
                </button>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
