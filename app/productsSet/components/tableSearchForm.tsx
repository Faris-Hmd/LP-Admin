"use client";

import { Search, X, Filter } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/data/categories";
import { useRef } from "react";

function TableSearchForm() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const activeKey = searchParams.get("key");
  const activeValue = searchParams.get("value");

  function handleCatOnchange(cat: string) {
    if (cat === "all") {
      handleReset();
    } else {
      replace(`${pathname}?key=p_cat&value=${cat}` as any);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const p_name = formData.get("p_name")?.toString();

    if (p_name?.trim()) {
      replace(
        `${pathname}?key=p_name&value=${encodeURIComponent(p_name.trim())}` as any,
      );
    }
  }

  function handleReset() {
    if (formRef.current) formRef.current.reset();
    replace(pathname as any);
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex items-center gap-2 w-full"
    >
      <div className="relative flex items-center grow group">
        <Search
          size={14}
          className="absolute left-3 text-slate-400 group-focus-within:text-blue-500 transition-colors"
        />

        <input
          type="text"
          name="p_name"
          placeholder="Filter..."
          defaultValue={activeKey === "p_name" ? activeValue || "" : ""}
          className="w-full pl-9 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 outline-none transition-all h-[36px]"
        />

        {activeValue && (
          <button
            type="button"
            onClick={handleReset}
            className="absolute right-2 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500 transition-all"
          >
            <X size={12} strokeWidth={3} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Select
          value={activeKey === "p_cat" ? activeValue || "" : ""}
          onValueChange={handleCatOnchange}
        >
          <SelectTrigger className="w-[120px] h-[36px] rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-tight shadow-none focus:ring-2 focus:ring-blue-500/10">
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-slate-400" />
              <SelectValue placeholder="TAG" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-lg shadow-xl dark:bg-slate-900 dark:border-slate-800">
            <SelectItem
              value="all"
              className="text-[10px] font-black text-blue-600"
            >
              ALL ITEMS
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem
                key={cat}
                value={cat}
                className="text-[10px] font-bold uppercase"
              >
                {cat.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="submit"
          className="flex items-center justify-center bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white w-[36px] h-[36px] rounded-lg transition-all active:scale-95 shadow-sm"
        >
          <Search size={16} strokeWidth={3} />
        </button>
      </div>
    </form>
  );
}

export default TableSearchForm;
