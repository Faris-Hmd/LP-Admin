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

export default function AdminProfilePage() {
  const { data: session } = useSession();

  if (!session?.user)
    return (
      <div className="flex items-center justify-center min-h-screen font-black uppercase text-xs tracking-widest">
        Access Denied
      </div>
    );

  const adminStats = [
    {
      label: "System Status",
      value: "Online",
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      label: "Auth Level",
      value: "Superuser",
      icon: ShieldCheck,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      label: "Session",
      value: "Active",
      icon: Clock,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-500/10",
    },
    {
      label: "Region",
      value: "Sudan",
      icon: UserCircle,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Admin <span className="text-blue-600">Account</span>
            </h1>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-rose-500/20"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Admin Identity Card */}
        <div className="relative isolate overflow-hidden bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-8 text-white border border-white/5">
          {/* Visual Effects */}
          <div className="absolute inset-0 -z-10">
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />
            <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-blue-600/20 to-transparent" />
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
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-white/10 bg-white/5 flex items-center justify-center text-4xl font-black">
                {session.user.name?.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl border-4 border-slate-900">
              <ShieldCheck size={20} className="text-white" />
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">
              Verified Administrator
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none">
              {session.user.name}
            </h1>
            <p className="text-slate-400 font-bold text-lg">{session.user.email}</p>
          </div>
        </div>

        {/* System Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {adminStats.map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center shadow-sm"
            >
              <div className={`p-3 rounded-2xl ${stat.bg} mb-3`}>
                <stat.icon className={`${stat.color}`} size={20} />
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {stat.value}
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
}