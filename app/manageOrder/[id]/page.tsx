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
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-900/40",
      icon: Clock,
      label: "Processing",
    },
    Shipped: {
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-900/40",
      icon: Truck,
      label: "Shipped",
    },
    Delivered: {
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-900/40",
      icon: CheckCircle2,
      label: "Delivered",
    },
    Cancelled: {
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      border: "border-rose-200 dark:border-rose-900/40",
      icon: AlertCircle,
      label: "Cancelled",
    },
  };

  const handleUpdateStatus = async (status: any) => {
    setUpdating(true);
    try {
      await upOrder(id as string, { status });
      toast.success(`Status updated to ${status}`);
      mutateOrder();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignDriver = async (driverId: string) => {
    setUpdating(true);
    try {
      await upOrder(id as string, { driverId });
      toast.success("Driver assigned successfully");
      mutateOrder();
    } catch (error) {
      toast.error("Failed to assign driver");
    } finally {
      setUpdating(false);
    }
  };

  if (orderLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
          Syncing Terminal...
        </p>
      </div>
    );

  if (!order)
    return (
      <div className="p-20 text-center font-black text-rose-500 uppercase tracking-widest text-xs">
        Order Not Found
      </div>
    );

  const assignedDriver = drivers?.find((d) => d.id === order.driverId);
  const currentStatus = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-0.5">
                <Hash size={10} />
                Order {order.id.slice(-6).toUpperCase()}
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Inspect <span className="text-blue-600">Order</span>
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
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-blue-600" />
                  <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                    Manifest
                  </h2>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {order.productsList.length} Units
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {order.productsList.map((product, idx) => (
                  <div
                    key={idx}
                    className="p-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">
                          {product.p_name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          {product.p_cat}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          {Number(product.p_cost).toLocaleString()}{" "}
                          <span className="text-[10px] text-blue-600">SDG</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                          Qty: {product.p_qu || 1}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Net Transaction
                  </span>
                  <span className="text-xl font-black text-blue-600 tracking-tighter">
                    {order.totalAmount.toLocaleString()}{" "}
                    <span className="text-xs">SDG</span>
                  </span>
                </div>
              </div>
            </section>

            {/* Client Data */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <button
                onClick={() => setIsCustomerInfoOpen(!isCustomerInfoOpen)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-900 dark:text-white" />
                  <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                    Client Data
                  </h2>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-slate-300 transition-transform ${isCustomerInfoOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isCustomerInfoOpen && (
                <div className="px-4 pb-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Full Name
                      </p>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase">
                        {order.customer_name || "N/A"}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Contact Line
                      </p>
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        {order.shippingInfo?.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                  {order.shippingInfo && (
                    <div className="p-4 bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg flex gap-3">
                      <MapPin
                        size={16}
                        className="text-blue-600 mt-1 shrink-0"
                      />
                      <div>
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">
                          Destination
                        </p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                          {order.shippingInfo.address},{" "}
                          {order.shippingInfo.city}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  Update Status
                </h2>
              </div>
              <div className="p-3 grid gap-1.5">
                {["Processing", "Shipped", "Delivered", "Cancelled"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(status)}
                      disabled={updating || order.status === status}
                      className={`w-full py-2.5 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        order.status === status
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:border-blue-500"
                      } disabled:opacity-50`}
                    >
                      {status}
                    </button>
                  ),
                )}
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  Logistics
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {assignedDriver && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-emerald-600 rounded-md flex items-center justify-center text-white shrink-0">
                        <Truck size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">
                          {assignedDriver.name}
                        </p>
                        <p className="text-[9px] text-emerald-600 font-bold uppercase">
                          {assignedDriver.vehicle}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <a
                        href={`tel:${assignedDriver.phone}`}
                        className="flex items-center justify-center gap-2 py-2 bg-white dark:bg-slate-800 rounded-md text-[9px] font-black uppercase text-slate-700 border border-slate-200 dark:border-slate-700"
                      >
                        <Phone size={12} /> Call
                      </a>
                      <a
                        href={`https://wa.me/${assignedDriver.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 py-2 bg-emerald-600 rounded-md text-[9px] font-black uppercase text-white"
                      >
                        <MessageSquare size={12} /> Chat
                      </a>
                    </div>
                  </div>
                )}

                <select
                  value={order.driverId || ""}
                  onChange={(e) => handleAssignDriver(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none"
                >
                  <option value="">[ SELECT DRIVER ]</option>
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
