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
    if (!window.confirm("Terminate this order protocol?")) return;

    startTransition(async () => {
      try {
        await delOrder(orderId);
        toast.success("Order purged from registry");
        router.refresh(); // Tells Next.js to re-run the server fetch
      } catch (err) {
        toast.error("Operation failed");
      }
    });
  };

  if (!initialOrders || initialOrders.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
        <Package size={40} className="mx-auto text-slate-300 mb-4" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
          Queue Empty
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 relative">
      {/* Floating Refresh (Since we are in server mode) */}
      <button
        onClick={() => router.refresh()}
        className="fixed bottom-20 right-10 z-50 p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform active:rotate-180"
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
              "bg-white dark:bg-slate-900 border rounded-2xl transition-all duration-200 overflow-hidden",
              isExpanded
                ? "ring-2 ring-blue-600/20 border-blue-600/50 shadow-xl"
                : "border-slate-200 dark:border-slate-800",
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
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400",
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
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-amber-50 text-amber-600 border-amber-100",
                    )}
                  >
                    {order.status || "Pending"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    ID: {order.id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <p className="text-lg font-black text-slate-900 dark:text-white leading-none">
                  {order.totalAmount.toLocaleString()}{" "}
                  <span className="text-[10px] text-blue-600">SDG</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/manageOrder/${order.id}` as any}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Settings2 size={16} />
                </Link>
                {isExpanded ? (
                  <ChevronUp size={20} className="text-slate-300" />
                ) : (
                  <ChevronDown size={20} className="text-slate-300" />
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="px-4 pb-4 bg-slate-50/50 dark:bg-slate-950/50 border-t dark:border-slate-800">
                <div className="py-4 space-y-2">
                  {order.productsList.map((p: any) => (
                    <div
                      key={p.id}
                      className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-white/5 flex justify-between items-center shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase truncate">
                          {p.p_name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          QTY: {p.p_qu} @ {Number(p.p_cost).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs font-black text-blue-600">
                        {(Number(p.p_cost) * Number(p.p_qu)).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(order.id);
                    }}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:scale-105 transition-transform"
                  >
                    {isPending ? "Purging..." : "[ Terminate Order ]"}
                  </button>
                  <p className="text-[10px] font-black text-slate-400 uppercase">
                    Authorized Transaction
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
