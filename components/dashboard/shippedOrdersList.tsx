"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  ArrowUpDown,
  Clock,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ShippedOrdersList({ orders }: { orders: any[] }) {
  const [sortBy, setSortBy] = useState<"date" | "price">("date");

  // Memoized sorting logic handling ISO Date Strings
  const sortedOrders = useMemo(() => {
    const list = [...orders];

    if (sortBy === "price") {
      return list.sort((a, b) => b.totalAmount - a.totalAmount);
    }

    // Default: Sort by ISO Date String (Newest first)
    return list.sort((a, b) => {
      // deliveredAt: "2025-12-31T22:20:07.756Z"
      const dateA = a.deliveredAt ? new Date(a.deliveredAt).getTime() : 0;
      const dateB = b.deliveredAt ? new Date(b.deliveredAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [orders, sortBy]);

  return (
    <div className="space-y-4">
      {/* Sort Control Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
            <ArrowUpDown size={14} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            تصفية الأرشيف
          </span>
        </div>

        <div className="flex bg-muted p-1 rounded-xl border border-border">
          <button
            onClick={() => setSortBy("date")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all",
              sortBy === "date"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            <Clock size={10} />
            الحديثة
          </button>
          <button
            onClick={() => setSortBy("price")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all",
              sortBy === "price"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            <DollarSign size={10} />
            القيمة
          </button>
        </div>
      </div>

      {/* Orders Feed */}
      <div className="grid gap-4">
        {sortedOrders.map((order: any) => (
          <div
            key={order.id}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all cursor-default"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 text-primary p-3 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="font-bold text-foreground leading-none mb-1 text-sm lg:text-base group-hover:text-primary transition-colors">
                  {order.customer_email}
                </p>
                <p className="text-[10px] text-muted-foreground font-black tracking-tight uppercase">
                  المرجع: {order.id.slice(0, 16).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-lg font-black text-foreground leading-none mb-1 transition-colors">
                {order.totalAmount.toLocaleString()}{" "}
                <span className="text-[10px] text-muted-foreground">ج.س</span>
              </p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-black justify-end uppercase tracking-widest mt-1">
                <Calendar size={12} />
                <span>
                  {/* Formats the ISO string to a readable date */}
                  {new Date(order.deliveredAt).toLocaleDateString("ar-EG", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
