"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { getOrder, upOrder } from "@/services/ordersServices";
import { getDrivers } from "@/services/driversServices";
import {
  ChevronLeft,
  Package,
  User,
  MapPin,
  Phone,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Hash,
  ShoppingBag,
  Loader2,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [isCustomerInfoOpen, setIsCustomerInfoOpen] = useState(false);

  const {
    data: order,
    isLoading: orderLoading,
    mutate: mutateOrder,
  } = useSWR(id ? `order-${id}` : null, () => getOrder(id as string));
  const { data: drivers, isLoading: driversLoading } = useSWR(
    "drivers",
    getDrivers,
  );

  const statusConfig = {
    Processing: {
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
      icon: Clock,
      label: "قيد المعالجة",
    },
    Shipped: {
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      icon: Truck,
      label: "تم الشحن",
    },
    Delivered: {
      color: "text-success",
      bg: "bg-success/10",
      border: "border-success/20",
      icon: CheckCircle2,
      label: "تم التوصيل",
    },
    Cancelled: {
      color: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/20",
      icon: AlertCircle,
      label: "ملغي",
    },
  };

  const handleUpdateStatus = async (status: any) => {
    setUpdating(true);
    try {
      await upOrder(id as string, { status });
      toast.success(
        `تم تحديث الحالة إلى ${statusConfig[status as keyof typeof statusConfig].label}`,
      );
      mutateOrder();
    } catch (error) {
      toast.error("فشل تحديث الحالة");
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignDriver = async (driverId: string) => {
    setUpdating(true);
    try {
      await upOrder(id as string, { driverId });
      toast.success("تم تعيين السائق بنجاح");
      mutateOrder();
    } catch (error) {
      toast.error("فشل تعيين السائق");
    } finally {
      setUpdating(false);
    }
  };

  if (orderLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
          جاري مزامنة البيانات...
        </p>
      </div>
    );

  if (!order)
    return (
      <div className="p-20 text-center font-black text-destructive uppercase tracking-widest text-xs">
        الطلب غير موجود
      </div>
    );

  const assignedDriver = drivers?.find((d) => d.id === order.driverId);
  const currentStatus = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-transparent pb-32">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground border border-border"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
                <Hash size={10} />
                الطلب {order.id.slice(-6).toUpperCase()}
              </div>
              <h1 className="text-xl font-black text-foreground uppercase tracking-tight">
                تفاصيل <span className="text-primary">الطلب</span>
              </h1>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${currentStatus.bg} ${currentStatus.color} border ${currentStatus.border}`}
            >
              <StatusIcon size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {currentStatus.label}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Manifest */}
            <section className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-primary" />
                  <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest">
                    محتويات الطلب
                  </h2>
                </div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {order.productsList.length} منتجات
                </span>
              </div>

              <div className="divide-y divide-border">
                {order.productsList.map((product, idx) => (
                  <div
                    key={idx}
                    className="p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-foreground uppercase truncate">
                          {product.p_name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                          {product.p_cat}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-foreground">
                          {Number(product.p_cost).toLocaleString()}{" "}
                          <span className="text-[10px] text-primary">ج.س</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                          الكمية: {product.p_qu || 1}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-muted/20 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    الإجمالي الصافي
                  </span>
                  <span className="text-xl font-black text-primary tracking-tighter">
                    {order.totalAmount.toLocaleString()}{" "}
                    <span className="text-xs">ج.س</span>
                  </span>
                </div>
              </div>
            </section>

            {/* Client Data & Transaction Info */}
            <section className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <button
                onClick={() => setIsCustomerInfoOpen(!isCustomerInfoOpen)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User size={16} className="text-foreground" />
                  <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest">
                    بيانات العميل والمعادلة
                  </h2>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-muted-foreground transition-transform ${isCustomerInfoOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isCustomerInfoOpen && (
                <div className="px-4 pb-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg border border-border">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                        الاسم الكامل
                      </p>
                      <p className="text-xs font-black text-foreground uppercase">
                        {order.customer_name || "غير متوفر"}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                        رقم التواصل
                      </p>
                      <p className="text-xs font-black text-foreground">
                        {order.shippingInfo?.phone || "غير متوفر"}
                      </p>
                    </div>
                  </div>
                  {order.shippingInfo && (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex gap-3">
                      <MapPin
                        size={16}
                        className="text-primary mt-1 shrink-0"
                      />
                      <div>
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">
                          عنوان التوصيل
                        </p>
                        <p className="text-xs font-bold text-foreground leading-relaxed">
                          {order.shippingInfo.address},{" "}
                          {order.shippingInfo.city}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Transaction Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dashed border-border">
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                        طريقة الدفع
                      </p>
                      <p className="text-xs font-black text-foreground uppercase">
                        {order.paymentMethod || "الدفع عند الاستلام"}
                      </p>
                    </div>
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                        المرجع
                      </p>
                      <p className="text-xs font-mono font-bold text-foreground">
                        {order.transactionReference || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <section className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border bg-muted/30">
                <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest">
                  تحديث الحالة
                </h2>
              </div>
              <div className="p-3 grid gap-1.5">
                {[
                  { key: "Processing", label: "قيد المعالجة" },
                  { key: "Shipped", label: "تم الشحن" },
                  { key: "Delivered", label: "تم التوصيل" },
                  { key: "Cancelled", label: "ملغي" },
                ].map((statusItem) => (
                  <button
                    key={statusItem.key}
                    onClick={() => handleUpdateStatus(statusItem.key)}
                    disabled={updating || order.status === statusItem.key}
                    className={`w-full py-2.5 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      order.status === statusItem.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground border border-border hover:border-primary"
                    } disabled:opacity-50`}
                  >
                    {statusItem.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border bg-muted/30">
                <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest">
                  اللوجستيات
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {assignedDriver && (
                  <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-success rounded-md flex items-center justify-center text-success-foreground shrink-0">
                        <Truck size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-foreground uppercase truncate">
                          {assignedDriver.name}
                        </p>
                        <p className="text-[9px] text-success font-bold uppercase">
                          {assignedDriver.vehicle}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <a
                        href={`tel:${assignedDriver.phone}`}
                        className="flex items-center justify-center gap-2 py-2 bg-card rounded-md text-[9px] font-black uppercase text-foreground border border-border hover:bg-muted transition-colors"
                      >
                        <Phone size={12} /> اتصال
                      </a>
                      <a
                        href={`https://wa.me/${assignedDriver.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 py-2 bg-success rounded-md text-[9px] font-black uppercase text-success-foreground hover:bg-success/90 transition-colors"
                      >
                        <MessageSquare size={12} /> محادثة
                      </a>
                    </div>
                  </div>
                )}

                <select
                  value={order.driverId || ""}
                  onChange={(e) => handleAssignDriver(e.target.value)}
                  className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">[ اختر سائق ]</option>
                  {drivers
                    ?.filter((d) => d.status === "Active")
                    .map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name.toUpperCase()}
                      </option>
                    ))}
                </select>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
