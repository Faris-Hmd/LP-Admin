"use client";

import React, { useState, useTransition } from "react";
import {
  Package,
  ChevronDown,
  ChevronUp,
  Settings2,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { delOrder } from "@/services/ordersServices";

export default function OrderListClient({
  initialOrders,
}: {
  initialOrders: any[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {},
  );

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleDelete = async (orderId: string) => {
    if (!window.confirm("هل تريد حذف هذا الطلب نهائياً؟")) return;

    startTransition(async () => {
      try {
        await delOrder(orderId);
        toast.success("تم حذف الطلب بنجاح");
        router.refresh(); // Tells Next.js to re-run the server fetch
      } catch (err) {
        toast.error("فشلت العملية");
      }
    });
  };

  if (!initialOrders || initialOrders.length === 0) {
    return (
      <div className="text-center py-20 bg-card rounded-3xl border-2 border-dashed border-border">
        <Package size={40} className="mx-auto text-muted-foreground mb-4" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
          قائمة الانتظار فارغة
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 relative">
      {/* Floating Refresh (Since we are in server mode) */}
      <button
        onClick={() => router.refresh()}
        className="fixed bottom-20 right-10 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-110 transition-transform active:rotate-180"
      >
        <RefreshCcw size={24} className={cn(isPending && "animate-spin")} />
      </button>

      {initialOrders.map((order) => {
        const isExpanded = expandedOrders[order.id];
        const totalItems = order.productsList.reduce(
          (sum: number, p: any) => sum + (Number(p.p_qu) || 0),
          0,
        );

        return (
          <div
            key={order.id}
            className={cn(
              "bg-card border rounded-2xl transition-all duration-200 overflow-hidden",
              isExpanded
                ? "ring-2 ring-primary/20 border-primary/50 shadow-xl"
                : "border-border",
            )}
          >
            <div
              onClick={() => toggleOrder(order.id)}
              className="p-4 cursor-pointer flex items-center gap-4"
            >
              <div
                className={cn(
                  "p-2.5 rounded-xl shrink-0",
                  isExpanded
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Package size={20} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                      order.status === "Delivered"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-warning/10 text-warning border-warning/20",
                    )}
                  >
                    {order.status === "Delivered"
                      ? "تم التوصيل"
                      : "قيد المعالجة"}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    ID: {order.id.slice(-6).toUpperCase()}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-lg font-black text-foreground leading-none">
                  {order.totalAmount.toLocaleString()}{" "}
                  <span className="text-[10px] text-primary">SDG</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/manageOrder/${order.id}` as any}
                  className="p-2.5 bg-muted text-muted-foreground rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Settings2 size={16} />
                </Link>
                {isExpanded ? (
                  <ChevronUp size={20} className="text-muted-foreground" />
                ) : (
                  <ChevronDown size={20} className="text-muted-foreground" />
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="px-4 pb-4 bg-muted/20 border-t border-border">
                <div className="py-4 space-y-2">
                  {order.productsList.map((p: any) => (
                    <div
                      key={p.id}
                      className="bg-card p-3 rounded-xl border border-border flex justify-between items-center shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-black text-foreground uppercase truncate">
                          {p.p_name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                          الكمية: {p.p_qu} @ {Number(p.p_cost).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs font-black text-primary">
                        {(Number(p.p_cost) * Number(p.p_qu)).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(order.id);
                    }}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive hover:scale-105 transition-transform"
                  >
                    {isPending ? "جاري الحذف..." : "[ حذف الطلب ]"}
                  </button>
                  <p className="text-[10px] font-black text-muted-foreground uppercase">
                    معاملة مصرح بها
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
