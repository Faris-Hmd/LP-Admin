"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, LogIn, ShieldAlert, Cpu } from "lucide-react";

export default function AdminLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dated analytics (admin default) if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/analatic" as any);
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4 bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.3em]">
          جاري تهيئة النظام...
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(#ef4444 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl shadow-primary/5 overflow-hidden">
          {/* Icon Header */}
          <div className="flex flex-col items-center mb-8 pt-4">
            <img
              src="/logo.png"
              alt="Liper Pizza Logo"
              className="w-20 h-20 object-cover rounded-full mb-12"
            />
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter text-center leading-none">
              لوحة <span className="text-primary">التحكم</span>
            </h1>
            <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.3em] mt-3">
              منطقة محظورة
            </p>
          </div>

          {/* Security Box */}
          <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-5 mb-8">
            <div className="flex items-start gap-4">
              <ShieldAlert size={20} className="text-destructive shrink-0" />
              <div>
                <p className="text-xs text-destructive font-black uppercase tracking-wider mb-1">
                  تطلّب صلاحيات
                </p>
                <p className="text-xs text-muted-foreground font-bold leading-relaxed">
                  فقط المشرفين المعتمدين يمكنهم الوصول إلى بيانات النظام
                  والمخزون وسجلات السائقين.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => signIn("google")}
            className="group relative w-full flex items-center justify-center gap-4 px-8 py-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[1.5rem] shadow-xl transition-all active:scale-[0.97]"
          >
            <LogIn
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
            <span className="text-xs font-black uppercase tracking-[0.15em]">
              تسجيل الدخول عبر Google
            </span>
          </button>

          {/* Footer Branding */}
          <div className="mt-10 pt-6 border-t border-border flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                النظام متصل
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.4em]">
              ليبر بيتزا • V2.0.4 • 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
