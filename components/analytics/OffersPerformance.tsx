"use client";

import useSWR from "swr";
import { Loader2, TrendingUp, ShoppingBag, BadgePercent } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OffersPerformance() {
  const {
    data: offers,
    error,
    isLoading,
  } = useSWR("/api/stats/offers", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshInterval: 60 * 1000,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    errorRetryCount: 3,
    errorRetryInterval: 5 * 1000,
  });

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
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/10 border-b border-border">
        <div className="flex items-center gap-2">
          <BadgePercent className="text-primary" size={18} />
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
            أداء العروض
          </h3>
        </div>
        <span className="text-xs font-bold text-muted-foreground bg-accent px-2 py-0.5 rounded-md border border-border">
          {offers.length} عروض نشطة
        </span>
      </div>

      {/* Compact List */}
      <div className="divide-y divide-border/50">
        {offers.map((offer: any, index: number) => (
          <div
            key={offer.offerId}
            className="flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors group"
          >
            {/* Rank */}
            <div
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded-lg text-sm font-black shrink-0",
                index === 0
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : index === 1
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : index === 2
                      ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      : "bg-muted text-muted-foreground",
              )}
            >
              {index + 1}
            </div>

            {/* Content Broad */}
            <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {offer.offerTitle}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    <ShoppingBag size={12} />
                    {offer.count} طلب
                  </span>
                </div>
              </div>

              {/* Revenue */}
              <div className="text-left shrink-0">
                <p className="text-sm font-black text-foreground">
                  {offer.revenue.toLocaleString()}{" "}
                  <span className="text-[10px] text-muted-foreground font-medium">
                    ج.س
                  </span>
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
