"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays } from "lucide-react";

export default function DateSelector({
  currentMonth, // e.g., "2026-01"
}: {
  currentMonth: string;
}) {
  const router = useRouter();

  // 1. Generate the combined options dynamically
  const years = [2024, 2025, 2026];
  const months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  const dateOptions = years
    .flatMap((year) => months.map((month) => `${year}-${month}`))
    .reverse(); // Reverse so newest dates (2026) appear first

  const formatLabel = (val: string) => {
    const [y, m] = val.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1);
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentMonth}
        onValueChange={(value) => router.push(value as any)}
      >
        <SelectTrigger className="w-[180px] h-10 rounded-xl bg-blue-50 border-blue-100 text-blue-700 font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-blue-400">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="opacity-70" />
            <SelectValue>{formatLabel(currentMonth)}</SelectValue>
          </div>
        </SelectTrigger>

        <SelectContent className="max-h-[300px] rounded-xl">
          {dateOptions.map((opt) => (
            <SelectItem key={opt} value={opt} className="font-semibold">
              <span className="font-mono mr-2 opacity-50 text-xs">{opt}</span>
              {formatLabel(opt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
