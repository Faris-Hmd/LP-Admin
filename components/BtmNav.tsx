"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ClipboardList, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

// Helper to get current YYYY-MM for the default analytics link
const currentMonthSlug = new Date().toISOString().slice(0, 7); // "2026-01"

const ADMIN_NAV = [
  {
    title: "Analytics",
    href: "/analatic",
    defaultSlug: `/${currentMonthSlug}`,
    icon: BarChart3,
  },
  { title: "Orders", href: "/manageOrder", icon: ClipboardList },
  { title: "Inventory", href: "/productsSet", icon: Settings },
  { title: "Drivers", href: "/drivers", icon: Users },
];

export default function AdminBtmNav() {
  const pathname = usePathname();
  const session = useSession();

  if (!session.data?.user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl pb-safe md:hidden h-16 px-2 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
      {ADMIN_NAV.map((item) => {
        const Icon = item.icon;

        // CHECK: Does the current URL start with the item's href?
        // This makes "/analatic/2026-01" trigger active for "/analatic"
        const isActive = pathname.startsWith(item.href);

        // For the Link href: use specific default slug for analytics, or just the href for others
        const destination = item.defaultSlug
          ? `${item.href}${item.defaultSlug}`
          : item.href;

        return (
          <Link
            key={item.href}
            href={destination as any}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 transition-all duration-300",
              isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-400 dark:text-slate-500",
            )}
          >
            <div
              className={cn(
                "relative flex items-center justify-center rounded-2xl py-1.5 px-4 transition-all duration-300",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 shadow-sm"
                  : "bg-transparent",
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
                className={cn("transition-transform", isActive && "scale-110")}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-tighter transition-all",
                isActive ? "opacity-100" : "opacity-60",
              )}
            >
              {item.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
