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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-0.5">
                  <ShieldCheck size={10} />
                  System Protocol
                </div>
                <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {isEdit ? "Edit Operative" : "New Operative"}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 md:p-8 mt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
            {/* Operator Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Operator Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={16}
                />
                <input
                  required
                  type="text"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold text-sm"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Login Identifier (Email)
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={16}
                />
                <input
                  required
                  type="email"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold text-sm"
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Secure Contact
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    required
                    type="tel"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold text-sm"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Vehicle ID
                </label>
                <div className="relative">
                  <Truck
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    required
                    type="text"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold text-sm"
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
                className="w-full bg-blue-600 text-white font-black py-4 rounded-lg shadow-lg flex items-center justify-center gap-3 uppercase tracking-widest text-[11px]"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {isEdit ? "Commit Changes" : "Deploy Operative"}
              </button>

              {isEdit && (
                <button
                  type="button"
                  disabled={loading || isPending}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-transparent text-red-500 border border-red-200 dark:border-red-900/50 font-black py-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Driver
                </button>
              )}
            </div>
          </div>
        </form>

        <footer className="mt-12 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
          Secure Admin Channel 2026 • Sudan Operations
        </footer>
      </div>

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Confirm Deletion
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Warning: This will permanently wipe operative{" "}
                <strong>{formData.name}</strong> from the active registry.
              </p>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                disabled={isPending}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500"
              >
                Cancel
              </button>
              <button
                disabled={isPending}
                onClick={handleDelete}
                className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest bg-red-600 text-white rounded-xl shadow-lg shadow-red-600/20 flex items-center justify-center"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Wipe Data"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
