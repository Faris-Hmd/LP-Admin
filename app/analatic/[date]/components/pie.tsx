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

const chartConfig = {
  PC: { label: "PC", color: "#cbd5e1" },
  LAPTOP: { label: "Laptop", color: "#94a3b8" },
  WEBCAMS: { label: "Webcams", color: "#64748b" },
  HARD_DRIVES: { label: "Hard Drives", color: "#475569" },
  HEADSETS: { label: "Headsets", color: "#334155" },
  KEYBOARDS: { label: "Keyboards", color: "#1e293b" },
  SPEAKERS: { label: "Speakers", color: "#0f172a" },
  PRINTERS: { label: "Printers", color: "#020617" },
  MICROPHONES: { label: "Microphones", color: "#cbd5e1" },
  MONITORS: { label: "Monitors", color: "#94a3b8" },
  TABLETS: { label: "Tablets", color: "#64748b" },
  PROJECTORS: { label: "Projectors", color: "#475569" },
  SCANNERS: { label: "Scanners", color: "#334155" },
  SSD: { label: "SSD", color: "#1e293b" },
  MOUSES: { label: "Mouses", color: "#0f172a" },
  DESKTOP: { label: "Desktop", color: "#3b82f6" },
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
      <div className="flex flex-col items-center justify-center h-[350px] w-full gap-4">
        <div className="h-40 w-40 rounded-full border-8 border-slate-100 dark:border-slate-800 border-t-blue-500 animate-spin" />
        <p className="text-[10px] font-black uppercase text-slate-400 animate-pulse">
          Analyzing Inventory...
        </p>
      </div>
    );
  }

  if (error || !data || data.length === 0)
    return (
      <div className="text-red-500 text-[10px] font-black uppercase p-10 text-center">
        Data Nullified: Failed to load stock
      </div>
    );

  return (
    <Card
      data-chart={id}
      className="flex flex-col rounded-xl border-none shadow-none w-full bg-transparent"
    >
      <ChartStyle id={id} config={chartConfig} />

      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">
          Inventory Distribution
        </CardTitle>
        <CardDescription className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
          Live stock levels per category
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 items-center justify-center p-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="aspect-square h-[220px]"
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
              innerRadius={75}
              strokeWidth={8}
              stroke="transparent"
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }: any) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 8} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 15}
                    innerRadius={outerRadius + 10}
                    opacity={0.3}
                  />
                </g>
              )}
            >
              {/* This maps the specific colors to the cells */}
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
                          className="fill-slate-900 dark:fill-white text-3xl font-black"
                        >
                          {data[activeIndex]?.quantity.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 22}
                          className="fill-slate-400 dark:fill-slate-500 text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                          Units
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <div className="pt-6">
        <Select value={activeCategory} onValueChange={setActiveCategory}>
          <SelectTrigger className="h-11 w-full text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 max-h-[300px]">
            {data.map((item: any) => {
              const config = (chartConfig as any)[item.category];
              return (
                <SelectItem
                  key={item.category}
                  value={item.category}
                  className="text-xs font-bold py-2.5 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 w-full">
                    <span
                      className="h-3 w-3 rounded-md shrink-0"
                      style={{ backgroundColor: config?.color || "#cbd5e1" }}
                    />
                    <span>{config?.label || item.category}</span>
                    <span className="ml-auto text-[10px] opacity-50 font-mono">
                      ({item.quantity})
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
