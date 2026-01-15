"use client";

import React, { useState, useTransition } from "react";
import { Driver } from "@/types/userTypes";
import {
  Truck,
  Phone,
  User,
  Save,
  ChevronLeft,
  Loader2,
  Mail,
  ShieldCheck,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addDriver, upDriver, delDriver } from "@/services/driversServices";

interface DriverFormProps {
  initialData?: Driver;
  isEdit?: boolean;
}

export function DriverForm({ initialData, isEdit }: DriverFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState<Omit<Driver, "id">>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    vehicle: initialData?.vehicle || "",
    status: initialData?.status || "Active",
    currentOrders: initialData?.currentOrders || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && initialData?.id) {
        const res = await upDriver(initialData.id, formData);
        if (res.success) {
          toast.success("Driver profile updated");
          router.push("/drivers" as any);
          router.refresh();
        } else {
          toast.error(res.error || "Update failed");
        }
      } else {
        const res = await addDriver(formData);
        if (res.success) {
          toast.success("New driver deployed");
          router.push("/drivers" as any);
          router.refresh();
        } else {
          toast.error(res.error || "Onboarding failed");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    startTransition(async () => {
      if (!initialData?.id) return;
      const res = await delDriver(initialData.id);
      if (res.success) {
        toast.success("Operative purged from system");
        router.push("/drivers" as any);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-transparent pb-32">
      <header className="bg-card md:bg-card/80 md:backdrop-blur-md border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground border border-border"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
                  <ShieldCheck size={10} />
                  بروتوكول النظام
                </div>
                <h1 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight">
                  {isEdit ? "تعديل بيانات السائق" : "إضافة سائق جديد"}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 md:p-8 mt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 md:p-8 shadow-sm space-y-6">
            {/* Operator Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                اسم السائق
              </label>
              <div className="relative">
                <User
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <input
                  required
                  type="text"
                  className="w-full pr-11 pl-4 py-3.5 bg-muted/50 border border-border rounded-lg outline-none font-bold text-sm text-foreground focus:ring-2 focus:ring-primary"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                معرف الدخول (البريد الإلكتروني)
              </label>
              <div className="relative">
                <Mail
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <input
                  required
                  type="email"
                  className="w-full pr-11 pl-4 py-3.5 bg-muted/50 border border-border rounded-lg outline-none font-bold text-sm text-foreground focus:ring-2 focus:ring-primary"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Contact & Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  رقم الهاتف
                </label>
                <div className="relative">
                  <Phone
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={16}
                  />
                  <input
                    required
                    type="tel"
                    className="w-full pr-11 pl-4 py-3.5 bg-muted/50 border border-border rounded-lg outline-none font-bold text-sm text-foreground focus:ring-2 focus:ring-primary"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  رقم المركبة
                </label>
                <div className="relative">
                  <Truck
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={16}
                  />
                  <input
                    required
                    type="text"
                    className="w-full pr-11 pl-4 py-3.5 bg-muted/50 border border-border rounded-lg outline-none font-bold text-sm text-foreground focus:ring-2 focus:ring-primary"
                    value={formData.vehicle}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicle: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-6">
              <button
                type="submit"
                disabled={loading || isPending}
                className="w-full bg-primary text-primary-foreground font-black py-4 rounded-lg shadow-lg flex items-center justify-center gap-3 uppercase tracking-widest text-[11px] hover:bg-primary/90 transition-colors"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {isEdit ? "حفظ التغييرات" : "إضافة السائق"}
              </button>

              {isEdit && (
                <button
                  type="button"
                  disabled={loading || isPending}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-transparent text-destructive border border-destructive/20 font-black py-4 rounded-lg hover:bg-destructive/10 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  حذف السائق
                </button>
              )}
            </div>
          </div>
        </form>

        <footer className="mt-12 text-center text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.4em]">
          قناة الإدارة الآمنة 2026 • عمليات السودان
        </footer>
      </div>

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 md:backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-3xl p-6 border border-border shadow-2xl">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
                تأكيد الحذف
              </h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                تحذير: هذا الإجراء سيؤدي إلى حذف السائق{" "}
                <strong>{formData.name}</strong> نهائياً من النظام.
              </p>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                disabled={isPending}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                disabled={isPending}
                onClick={handleDelete}
                className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest bg-destructive text-destructive-foreground rounded-xl shadow-lg shadow-destructive/20 flex items-center justify-center hover:bg-destructive/90 transition-colors"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "حذف البيانات"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
