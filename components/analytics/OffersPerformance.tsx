"use client";

import useSWR from "swr";
import { getOfferStats } from "@/services/ordersServices";
import { Loader2, TrendingUp, ShoppingBag, BadgePercent } from "lucide-react";
import { cn } from "@/lib/utils";

// SWR fetcher wrapper for server action
const fetcher = () => getOfferStats();

export default function OffersPerformance() {
  const { data: offers, error, isLoading } = useSWR("offers-stats", fetcher);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-card rounded-xl border border-border shadow-sm">
        <Loader2 className="animate-spin text-primary" size={24} />
        <span className="mr-3 text-xs font-bold text-muted-foreground">
          جارٍ تحليل بيانات العروض...
        </span>
      </div>
    );
  }

  if (error || !offers) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-center text-xs font-bold">
        فشل تحميل بيانات العروض
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="p-8 text-center bg-card rounded shadow-sm border border-border">
        <BadgePercent
          className="mx-auto text-muted-foreground mb-2"
          size={32}
        />
        <p className="text-xs font-black text-muted-foreground uppercase tracking-wider">
          لا توجد بيانات للعروض حتى الآن
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card p-4 rounded shadow-sm border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BadgePercent className="text-primary" size={18} />
          <h3 className="text-sm font-black text-foreground uppercase tracking-tight">
            أداء العروض
          </h3>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground bg-accent px-2 py-1 rounded">
          الكل ({offers.length})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer, index) => (
          <div
            key={offer.offerId}
            className="border border-border rounded p-4 hover:bg-muted/30 transition-colors flex flex-col gap-3 group"
          >
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border",
                  index === 0
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground border-border",
                )}
              >
                #{index + 1}
              </span>
              <div className="p-1.5 rounded-full bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                <ShoppingBag size={14} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-foreground truncate mb-1">
                {offer.offerTitle}
              </h4>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-black text-foreground leading-none">
                    {offer.count}
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">
                    طلب إجمالي
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-primary leading-none">
                    {offer.revenue.toLocaleString()}
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">
                    الإيرادات (ج.س)
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
