"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity } from "lucide-react";

type DaySales = {
  month: string;
  day: number;
  sales: number;
  orders: number;
  formattedDate?: string;
};

const chartConfig = {
  sales: { label: "Revenue", color: "#2563eb" },
  orders: { label: "Orders", color: "#10b981" },
};

export default function RevenueAnalytics({
  salesData = [],
}: {
  salesData: DaySales[];
}) {
  const { totalSales, totalOrders } = useMemo(() => {
    return salesData.reduce(
      (acc, curr) => ({
        totalSales: acc.totalSales + curr.sales,
        totalOrders: acc.totalOrders + curr.orders,
      }),
      { totalSales: 0, totalOrders: 0 },
    );
  }, [salesData]);

  return (
    /* min-w-0 is critical here to prevent flex-basis overgrowth */
    <Card className="w-full border-none shadow-none bg-transparent min-w-0 overflow-visible">
      <div className="flex items-center w-full justify-between gap-2 px-1 mb-3">
        <div className="space-y-0.5 w-full">
          <CardTitle className="text-base font-black text-foreground tracking-tight uppercase">
            تحليلات <span className="text-primary">الإيرادات</span>
          </CardTitle>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-[8px] uppercase tracking-[0.15em]">
            <span className="flex h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
            <TrendingUp className="w-2.5 h-2.5" />
            {totalOrders.toLocaleString()} تم تنفيذها بنجاح
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-baseline gap-1 bg-primary text-primary-foreground font-black px-3 py-1 rounded-lg shadow shadow-primary/20">
            <span className="text-sm font-mono">
              {totalSales.toLocaleString()}
            </span>
            <span className="text-[8px] opacity-70 uppercase tracking-tighter">
              SDG
            </span>
          </div>
        </div>
      </div>

      {/* CHART WRAPPER: Fixed height and relative positioning */}
      <div className="relative w-full h-[120px] sm:h-[200px] px-0 overflow-hidden">
        {salesData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl">
            <Activity className="text-muted-foreground mb-1.5" size={16} />
            <span className="text-[8px] font-black uppercase text-muted-foreground">
              بانتظار البيانات...
            </span>
          </div>
        ) : (
          /* aspect-auto overrides the default shadcn aspect-video */
          <ChartContainer
            config={chartConfig}
            className="h-full w-full aspect-auto"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesData}
                margin={{ left: 0, right: 10, top: 10, bottom: 0 }}
              >
                <defs>
                  {/* Revenue Gradient */}
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>

                  {/* Orders Gradient - Added this */}
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={false}
                  strokeDasharray="4 4"
                  className="stroke-border"
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  minTickGap={30}
                  className="text-[8px] font-black text-muted-foreground uppercase"
                />
                <YAxis hide domain={["auto", "auto"]} />

                <ChartTooltip
                  cursor={{
                    stroke: "#ef4444",
                    strokeWidth: 2,
                    strokeDasharray: "4 4",
                  }}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      className="rounded-xl border-border shadow-2xl bg-card/95 backdrop-blur-md"
                    />
                  }
                />

                {/* EXISTING: Revenue Area */}
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#ef4444"
                  strokeWidth={3}
                  fill="url(#salesGrad)"
                  animationDuration={1500}
                  activeDot={{ r: 5, strokeWidth: 0, fill: "#ef4444" }}
                />

                {/* Hidden Orders Area - This makes it show in the Tooltip only */}
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="transparent"
                  fill="transparent"
                  strokeWidth={0}
                  activeDot={false} // Prevents a dot from appearing on the hidden line
                  animationDuration={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </Card>
  );
}
