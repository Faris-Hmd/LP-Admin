"use client";

import { usePathname } from "next/navigation";
import { BarChart3, Settings, Users, ClipboardList } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Logo } from "@/components/Logo";
import { ModeToggle } from "@/components/ModeToggle";
import Link from "next/link";
import { useSession } from "next-auth/react";

// Get current YYYY-MM dynamically
const currentMonthSlug = new Date().toISOString().slice(0, 7);

const ADMIN_LINKS = [
  {
    title: "Analytics",
    href: "/analatic", // Base path for active check
    defaultSlug: `/${currentMonthSlug}`, // Default month to navigate to
    icon: BarChart3,
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    title: "Orders",
    href: "/manageOrder",
    icon: ClipboardList,
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    title: "Inventory",
    href: "/productsSet",
    icon: Settings,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Drivers",
    href: "/drivers",
    icon: Users,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) return null;

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300 bg-white/80 dark:bg-slate-900/80 py-3 border-b border-slate-100 dark:border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        {/* --- BRAND --- */}
        <div className="flex items-center gap-8">
          <Link
            href={`/analatic/${currentMonthSlug}` as any}
            className="group flex items-center gap-2.5 transition-transform active:scale-95"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform duration-300">
              <Logo className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                SUDAN<span className="text-blue-600">PC</span>
              </span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-0.5">
                Control Panel
              </span>
            </div>
          </Link>

          {/* --- ADMIN LINKS (Desktop) --- */}
          <div className="hidden lg:flex items-center gap-1">
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
            {ADMIN_LINKS.map((item) => {
              const Icon = item.icon;

              // Active check: uses startsWith so /analatic/2026-02 stays active on the /analatic tab
              const isActive = pathname.startsWith(item.href);

              // Determine actual destination
              const destination = item.defaultSlug
                ? `${item.href}${item.defaultSlug}`
                : item.href;

              return (
                <Link
                  key={item.href}
                  href={destination as any}
                  className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                    isActive
                      ? `${item.color} ${item.bg}`
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>

        {/* --- RIGHT ACTIONS --- */}
        <div className="flex items-center gap-4">
          <ModeToggle />

          <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-1 hidden sm:block" />

          {/* Admin Identity */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end leading-none">
              <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">
                Administrator
              </span>
              <span className="text-[9px] font-bold text-emerald-500 uppercase">
                System Online
              </span>
            </div>
            <Link href="/profile">
              <Avatar className="h-9 w-9 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center bg-white dark:bg-slate-800 transition-transform active:scale-90">
                <AvatarImage
                  src={session?.user?.image || ""}
                  className="h-full w-full object-cover"
                />
                <AvatarFallback className="bg-blue-600 text-white font-black text-xs h-full w-full flex items-center justify-center">
                  AD
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
