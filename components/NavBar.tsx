"use client";

import { usePathname } from "next/navigation";
import { BarChart3, Settings, Users, ClipboardList } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { ModeToggle } from "@/components/ModeToggle";
import Link from "next/link";
import { useSession } from "next-auth/react";

// Get current YYYY-MM dynamically
const currentMonthSlug = new Date().toISOString().slice(0, 7);

const ADMIN_LINKS = [
  {
    title: "التحليلات",
    href: "/analatic", // Base path for active check
    defaultSlug: `/${currentMonthSlug}`, // Default month to navigate to
    icon: BarChart3,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "الطلبات",
    href: "/manageOrder",
    icon: ClipboardList,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "المخزون",
    href: "/productsSet",
    icon: Settings,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "السائقين",
    href: "/drivers",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) return null;

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300 bg-card md:bg-card/80 py-3 border-b border-border md:backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        {/* --- BRAND --- */}
        <div className="flex items-center gap-8">
          <Link
            href={`/analatic/${currentMonthSlug}` as any}
            className="group flex items-center gap-2.5 transition-transform active:scale-95"
          >
            <div className="rounded w-10 h-10 bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-300">
              <img
                src="/logo.png"
                alt="Liper Pizza Logo"
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black text-foreground tracking-tight">
                ليبر<span className="text-primary">بيتزا</span>
              </span>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-0.5">
                لوحة التحكم
              </span>
            </div>
          </Link>

          {/* --- ADMIN LINKS (Desktop) --- */}
          <div className="hidden lg:flex items-center gap-1">
            <div className="h-6 w-px bg-border mx-2" />
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
                  className={`px-4 py-2 rounded text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                    isActive
                      ? `${item.color} ${item.bg}`
                      : "text-muted-foreground hover:bg-muted"
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

          <div className="h-8 w-px bg-border mx-1 hidden sm:block" />

          {/* Admin Identity */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end leading-none">
              <span className="text-[10px] font-black uppercase text-foreground">
                المشرف
              </span>
              <span className="text-[9px] font-bold text-success uppercase">
                النظام متصل
              </span>
            </div>
            <Link href="/profile">
              <Avatar className="h-9 w-9 overflow-hidden rounded border border-border shadow-sm flex items-center justify-center bg-card transition-transform active:scale-90">
                <AvatarImage
                  src={session?.user?.image || ""}
                  className="h-full w-full object-cover"
                />
                <AvatarFallback className="bg-primary text-primary-foreground font-black text-xs h-full w-full flex items-center justify-center">
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
