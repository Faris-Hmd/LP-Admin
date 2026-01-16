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
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const {
    data: order,
    isLoading: orderLoading,
    mutate: mutateOrder,
  } = useSWR(id ? `order-${id}` : null, () => getOrder(id as string));
  const { data: drivers, isLoading: driversLoading } = useSWR(
    "drivers",
    getDrivers,
  );

  const handleCopy = (text: string, type: "id" | "ref") => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
    toast.success("تم النسخ للمحافظة");
  };

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
      <div className="p-20 text-center font-black text-destructive uppercase tracking-widest text-sm">
        الطلب غير موجود
      </div>
    );

  const assignedDriver = drivers?.find((d: any) => d.id === order.driverId);
  const currentStatus = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-transparent pb-32">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2.5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground border border-border"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                <Hash size={10} />
                الطلب {order.id.slice(-8).toUpperCase()}
                <button
                  onClick={() => handleCopy(order.id, "id")}
                  className="p-1 hover:bg-primary/10 rounded transition-colors"
                >
                  {copiedId ? (
                    <Check size={10} className="text-success" />
                  ) : (
                    <Copy size={10} className="text-muted-foreground" />
                  )}
                </button>
              </div>
              <h1 className="text-xl font-black text-foreground uppercase tracking-tight leading-tight">
                تفاصيل <span className="text-primary">الطلب</span>
              </h1>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded ${currentStatus.bg} ${currentStatus.color} border ${currentStatus.border}`}
            >
              <StatusIcon size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {currentStatus.label}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Manifest */}
            <section className="bg-card rounded border border-border overflow-hidden shadow-sm">
              <div className="px-3 py-1.5 border-b border-border flex items-center justify-between bg-muted/10">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-primary" />
                  <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest">
                    محتويات الطلب
                  </h2>
                </div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-3 py-1 bg-muted rounded">
                  {order.productsList.length} منتجات
                </span>
              </div>

              <div className="divide-y divide-border/50">
                {order.productsList.map((product, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2.5 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-foreground uppercase truncate">
                          {product.p_name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                          {product.p_cat}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-foreground">
                          {Number(product.p_cost).toLocaleString()}{" "}
                          <span className="text-[10px] text-primary">ج.س</span>
                        </p>
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">
                          QTY: {product.p_qu || 1}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-3 py-2 bg-muted/20 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    الإجمالي الصافي
                  </span>
                  <span className="text-lg font-black text-primary tracking-tighter">
                    {order.totalAmount.toLocaleString()}{" "}
                    <span className="text-[10px]">ج.س</span>
                  </span>
                </div>
              </div>
            </section>

            {/* Client Data & Transaction Info - Now Uncollapsible */}
            <section className="bg-card rounded border border-border overflow-hidden shadow-sm">
              <div className="px-3 py-1.5 border-b border-border bg-muted/10">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-foreground" />
                  <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest">
                    بيانات العميل والمعادلة
                  </h2>
                </div>
              </div>

              <div className="p-2 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between py-1.5 px-2 bg-muted/30 rounded border border-border">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                      الاسم الكامل
                    </span>
                    <span className="text-[11px] font-black text-foreground uppercase truncate ml-2">
                      {order.customer_name || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-2 bg-muted/30 rounded border border-border">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                      رقم التواصل
                    </span>
                    <span className="text-[11px] font-black text-foreground ml-2">
                      {order.shippingInfo?.phone || "N/A"}
                    </span>
                  </div>
                </div>

                {order.shippingInfo && (
                  <div className="p-2 bg-primary/5 border border-primary/10 rounded flex gap-2.5">
                    <MapPin
                      size={14}
                      className="text-primary mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-0.5">
                        عنوان التوصيل
                      </p>
                      <p className="text-[11px] font-bold text-foreground leading-tight">
                        {order.shippingInfo.address}, {order.shippingInfo.city}
                      </p>
                    </div>
                  </div>
                )}

                {/* Transaction Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-dashed border-border">
                  <div className="flex items-center justify-between py-1.5 px-2 bg-card rounded border border-border">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                      طريقة الدفع
                    </span>
                    <span className="text-[11px] font-black text-foreground uppercase ml-2">
                      {order.paymentMethod || "COD"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-2 bg-card rounded border border-border relative group">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                      المرجع
                    </span>
                    <div className="flex items-center gap-1.5 ml-2 min-w-0">
                      <span className="text-[11px] font-mono font-bold text-foreground truncate">
                        {order.transactionReference || "N/A"}
                      </span>
                      {order.transactionReference && (
                        <button
                          onClick={() =>
                            handleCopy(
                              order.transactionReference as string,
                              "ref",
                            )
                          }
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title="Copy reference"
                        >
                          {copiedRef ? (
                            <Check size={14} className="text-success" />
                          ) : (
                            <Copy size={14} className="text-muted-foreground" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <section className="bg-card rounded border border-border overflow-hidden shadow-sm">
              <div className="px-3 py-1.5 border-b border-border bg-muted/10">
                <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest">
                  حالة الطلب
                </h2>
              </div>
              <div className="p-2">
                <div className="relative">
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    disabled={updating}
                    className="w-full appearance-none px-4 py-2.5 bg-muted/50 border border-border rounded text-foreground text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    {[
                      { key: "Processing", label: "قيد المعالجة" },
                      { key: "Shipped", label: "تم الشحن" },
                      { key: "Delivered", label: "تم التوصيل" },
                      { key: "Cancelled", label: "ملغي" },
                    ].map((statusItem) => (
                      <option key={statusItem.key} value={statusItem.key}>
                        {statusItem.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <ChevronDown size={12} className="text-muted-foreground" />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-card rounded border border-border overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-border bg-muted/10">
                <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest">
                  اللوجستيات والعمليات
                </h2>
              </div>
              <div className="p-3 space-y-3">
                {assignedDriver && (
                  <div className="p-2.5 bg-success/5 rounded border border-success/10">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-7 h-7 bg-success rounded flex items-center justify-center text-success-foreground shrink-0 shadow-sm">
                        <Truck size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-foreground uppercase truncate">
                          {assignedDriver.name}
                        </p>
                        <p className="text-[9px] text-success font-bold uppercase tracking-tighter">
                          {assignedDriver.vehicle}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <a
                        href={`tel:${assignedDriver.phone}`}
                        className="flex items-center justify-center gap-1.5 py-2 bg-card rounded text-[9px] font-black uppercase text-foreground border border-border hover:bg-muted transition-colors"
                      >
                        <Phone size={12} /> اتصال
                      </a>
                      <button
                        onClick={() =>
                          window.open(
                            `https://wa.me/${assignedDriver.phone.replace(/[^0-9]/g, "")}`,
                            "_blank",
                          )
                        }
                        className="flex items-center justify-center gap-1.5 py-2 bg-success rounded text-[9px] font-black uppercase text-success-foreground hover:bg-success/90 transition-colors"
                      >
                        <MessageSquare size={12} /> محادثة
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <select
                    value={order.driverId || ""}
                    onChange={(e) => handleAssignDriver(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-muted/50 border border-border rounded text-foreground text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    <option value="">[ تعيين سائق ]</option>
                    {drivers
                      ?.filter((d) => d.status === "Active")
                      .map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name.toUpperCase()}
                        </option>
                      ))}
                  </select>
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <ChevronDown size={12} className="text-muted-foreground" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
