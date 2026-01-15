"use client";

import { signOut, useSession } from "next-auth/react";
import {
  LogOut,
  ShieldCheck,
  Activity,
  UserCircle,
  Clock,
  Settings,
} from "lucide-react";
import Link from "next/link";

// ... imports

export default function AdminProfilePage() {
  const { data: session } = useSession();

  if (!session?.user)
    return (
      <div className="flex items-center justify-center min-h-screen font-black uppercase text-xs tracking-widest text-destructive">
        تم رفض الوصول
      </div>
    );

  const adminStats = [
    {
      label: "حالة النظام",
      value: "متصل",
      icon: Activity,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "مستوى الصلاحية",
      value: "مسؤول شامل",
      icon: ShieldCheck,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "الجلسة",
      value: "نشطة",
      icon: Clock,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "المنطقة",
      value: "السودان",
      icon: UserCircle,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-foreground uppercase tracking-tight">
              حساب <span className="text-primary">المسؤول</span>
            </h1>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-4 py-2 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-destructive/20"
          >
            <LogOut size={14} />
            تسجيل خروج
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Admin Identity Card */}
        <div className="relative isolate overflow-hidden bg-card-foreground p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-8 text-card border border-white/5">
          {/* Visual Effects */}
          <div className="absolute inset-0 -z-10">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(var(--primary) 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-primary/20 to-transparent" />
          </div>

          {/* Avatar Section */}
          <div className="relative shrink-0">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt="Admin"
                className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-white/10 object-cover shadow-2xl"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-white/10 bg-white/5 flex items-center justify-center text-4xl font-black text-white">
                {session.user.name?.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-xl border-4 border-card-foreground">
              <ShieldCheck size={20} className="text-primary-foreground" />
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-foreground/80 text-[10px] font-black uppercase tracking-widest mb-2">
              مشرف تم التحقق منه
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none text-white">
              {session.user.name}
            </h1>
            <p className="text-white/60 font-bold text-lg">
              {session.user.email}
            </p>
          </div>
        </div>

        {/* System Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {adminStats.map((stat, i) => (
            <div
              key={i}
              className="bg-card p-5 rounded-2xl border border-border flex flex-col items-center text-center shadow-sm"
            >
              <div className={`p-3 rounded-2xl ${stat.bg} mb-3`}>
                <stat.icon className={`${stat.color}`} size={20} />
              </div>
              <span className="text-lg font-black text-foreground uppercase tracking-tighter">
                {stat.value}
              </span>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
