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
    return date.toLocaleString("ar-EG", { month: "long", year: "numeric" });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentMonth}
        onValueChange={(value) => router.push(value as any)}
      >
        <SelectTrigger className="w-[180px] h-10 rounded-xl bg-card border-border text-foreground font-bold focus:ring-primary">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="opacity-70 text-primary" />
            <SelectValue>{formatLabel(currentMonth)}</SelectValue>
          </div>
        </SelectTrigger>

        <SelectContent className="max-h-[300px] rounded-xl bg-popover border-border">
          {dateOptions.map((opt) => (
            <SelectItem
              key={opt}
              value={opt}
              className="font-semibold text-foreground focus:bg-muted"
            >
              <span className="font-mono mr-2 opacity-50 text-xs">{opt}</span>
              {formatLabel(opt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
