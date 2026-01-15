"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, LogIn, ShieldAlert, Cpu } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function AdminLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dated analytics (admin default) if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/analatic/2026-01" as any);
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4 bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
          Initializing Terminal...
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50 dark:bg-slate-950">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
          style={{ 
            backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px)`, 
            backgroundSize: '32px 32px' 
          }} 
        />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-10 shadow-2xl shadow-blue-500/5 overflow-hidden">
          
          {/* Icon Header */}
          <div className="flex flex-col items-center mb-8 pt-4">
              <Logo className="text-white p-2 w-20 h-20 bg-slate-900 dark:bg-blue-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20 transition-transform hover:scale-105" />
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter text-center leading-none">
              Control <span className="text-blue-600">Panel</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3">
              Restricted Area
            </p>
          </div>

          {/* Security Box */}
          <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-2xl p-5 mb-8">
            <div className="flex items-start gap-4">
              <ShieldAlert size={20} className="text-rose-500 shrink-0" />
              <div>
                <p className="text-[11px] text-rose-700 dark:text-rose-400 font-black uppercase tracking-wider mb-1">
                  Authorization Required
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                  Only verified administrators can access system data, inventory, and driver logs.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => signIn("google")}
            className="group relative w-full flex items-center justify-center gap-4 px-8 py-5 bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white rounded-[1.5rem] shadow-xl transition-all active:scale-[0.97]"
          >
            <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-[11px] font-black uppercase tracking-[0.15em]">
              Admin Login via Google
            </span>
          </button>

          {/* Footer Branding */}
          <div className="mt-10 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Online</span>
            </div>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.4em]">
              SUDANPC • V2.0.4 • 2026
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}