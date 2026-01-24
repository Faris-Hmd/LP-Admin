"use client";

import useSWR from "swr";
import { Pie, PieChart, Label, Sector, Cell } from "recharts";
import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { categoryLabels } from "@/data/categoryMapping";

const chartConfig = {
  PC: { label: categoryLabels.PC, color: "#ef4444" }, // Red
  LAPTOP: { label: categoryLabels.LAPTOP, color: "#f97316" }, // Orange
  WEBCAMS: { label: categoryLabels.WEBCAMS, color: "#f59e0b" }, // Amber
  HARD_DRIVES: { label: categoryLabels.HARD_DRIVES, color: "#3b82f6" }, // Blue
  HEADSETS: { label: categoryLabels.HEADSETS, color: "#78350f" }, // Coffee
  KEYBOARDS: { label: categoryLabels.KEYBOARDS, color: "#ec4899" }, // Pink
  SPEAKERS: { label: categoryLabels.SPEAKERS, color: "#22c55e" }, // Green
  PRINTERS: { label: categoryLabels.PRINTERS, color: "#8b5cf6" }, // Purple
  MICROPHONES: { label: categoryLabels.MICROPHONES, color: "#6366f1" }, // Indigo
  MONITORS: { label: categoryLabels.MONITORS, color: "#dc2626" }, // Deep Red
  TABLETS: { label: categoryLabels.TABLETS, color: "#06b6d4" }, // Cyan
  PROJECTORS: { label: categoryLabels.PROJECTORS, color: "#14b8a6" }, // Teal
  SCANNERS: { label: categoryLabels.SCANNERS, color: "#84cc16" }, // Lime
  SSD: { label: categoryLabels.SSD, color: "#ea580c" }, // Dark Orange
  MOUSES: { label: categoryLabels.MOUSES, color: "#eab308" }, // Yellow
  DESKTOP: { label: categoryLabels.DESKTOP, color: "#0ea5e9" }, // Sky
} satisfies ChartConfig;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ChartPieInteractive() {
  const id = "pie-interactive";

  const {
    data: rawData,
    isLoading,
    error,
  } = useSWR("/api/stats/categories", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60000,
  });

  const [activeCategory, setActiveCategory] = useState("");

  // Transform data to include the color fill from chartConfig
  const data = useMemo(() => {
    if (!rawData || Array.isArray(rawData) === false) return [];
    return rawData.map((item: any) => ({
      ...item,
      fill: (chartConfig as any)[item.category]?.color || "#cbd5e1",
    }));
  }, [rawData]);

  useEffect(() => {
    if (data && data.length > 0 && !activeCategory) {
      setActiveCategory(data[0].category);
    }
  }, [data, activeCategory]);

  const activeIndex = useMemo(
    () => data?.findIndex((item: any) => item.category === activeCategory) ?? 0,
    [activeCategory, data],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] w-full gap-4">
        <div className="h-32 w-32 rounded-full border-8 border-border border-t-primary animate-spin" />
        <p className="text-[10px] font-black uppercase text-muted-foreground animate-pulse">
          جاري تحليل المخزون...
        </p>
      </div>
    );
  }

  if (error || !data || data.length === 0)
    return (
      <div className="text-destructive text-[10px] font-black uppercase p-10 text-center">
        بيانات مفقودة: فشل تحميل المخزون
      </div>
    );

  return (
    <div data-chart={id} className="w-full grid grid-cols-2 gap-4 items-center">
      <ChartStyle id={id} config={chartConfig} />

      {/* Chart Column */}
      <div className="flex items-center justify-center relative min-h-[140px]">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="aspect-square h-[140px] w-[140px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="quantity"
              nameKey="category"
              innerRadius={45}
              strokeWidth={4}
              stroke="transparent"
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }: any) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 6} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 12}
                    innerRadius={outerRadius + 8}
                    opacity={0.3}
                  />
                </g>
              )}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}

              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-black"
                        >
                          {data[activeIndex]?.quantity.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 16}
                          className="fill-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                          وحدة
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>

      {/* Controls Column */}
      <div className="flex flex-col justify-center gap-2">
        <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">
          الفئة المختارة
        </label>
        <Select value={activeCategory} onValueChange={setActiveCategory}>
          <SelectTrigger className="h-10 w-full text-sm font-bold rounded-lg bg-card border-border text-foreground shadow-sm focus:ring-2 focus:ring-primary/10 outline-none">
            <SelectValue placeholder="اختر الفئة" />
          </SelectTrigger>
          <SelectContent className="rounded-lg border-border max-h-[220px]">
            {data.map((item: any) => {
              const config = (chartConfig as any)[item.category];
              return (
                <SelectItem
                  key={item.category}
                  value={item.category}
                  className="text-sm font-bold py-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: config?.color || "#cbd5e1" }}
                    />
                    <span>{config?.label || item.category}</span>
                    <span className="ml-auto opacity-50 font-mono">
                      {item.quantity}
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <div className="mt-2 p-2 rounded-lg bg-muted/10 border border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-muted-foreground">النسبة:</span>
            <span className="font-black text-primary">
              {data.length > 0 && activeIndex >= 0
                ? Math.round(
                    (data[activeIndex].quantity /
                      data.reduce((a: any, b: any) => a + b.quantity, 0)) *
                      100,
                  ) + "%"
                : "0%"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
