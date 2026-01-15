import { Timestamp } from "firebase/firestore";
import { Package, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import DateSelector from "@/components/DataPicker";
import { getOrdersWhOrdered } from "@/services/ordersServices";
import ShippedOrdersList from "@/components/dashboard/shippedOrdersList";

export const revalidate = 20;

// Pre-render months of 2026 (Updated to current year context)
export async function generateStaticParams() {
  const months = Array.from(
    { length: 3 },
    (_, i) => `2026-${String(i + 1).padStart(2, "0")}`,
  );
  return months.map((date) => ({
    date: date,
  }));
}

async function getMonthlyDeliveredOrders(dateStr: string) {
  const [year, month] = dateStr.split("-").map(Number);

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  return await getOrdersWhOrdered([
    { field: "status", op: "==", val: "Delivered" },
    { field: "deleveratstamp", op: ">=", val: Timestamp.fromDate(startDate) },
    { field: "deleveratstamp", op: "<=", val: Timestamp.fromDate(endDate) },
  ]);
}

export default async function ShippedOrdersPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  console.log(" date", date);
  const orders = await getMonthlyDeliveredOrders(date);

  const [year, month] = date.split("-");
  const monthName = new Date(Number(year), Number(month) - 1).toLocaleString(
    "default",
    { month: "long" },
  );

  const totalOrderCount = orders.length;
  const totalSalesVolume = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Shipped <span className="text-blue-600">Orders</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 mt-1">
                <DateSelector currentMonth={date} />
              </div>
              <Link
                href={`/manageOrder` as any}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 dark:border-blue-900/30 whitespace-nowrap"
              >
                <Package size={16} />
                <span className="hidden md:inline">Active Queue</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* --- SUMMARY STATS --- */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
          <div className="bg-blue-600 p-8 rounded-[2rem] shadow-xl shadow-blue-500/20 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase opacity-70 tracking-[0.2em] mb-2">
                Monthly Revenue
              </p>
              <p className="text-2xl md:text-3xl font-black tracking-tighter">
                {totalSalesVolume.toLocaleString()}{" "}
                <span className="text-sm font-bold opacity-60">SDG</span>
              </p>
            </div>
            <CheckCircle2 className="absolute right-[-10px] bottom-[-10px] size-32 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
            <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-2">
              Total Shipments
            </p>
            <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
              {totalOrderCount}{" "}
              <span className="text-sm font-bold text-slate-400">Orders</span>
            </p>
          </div>
        </div>

        {/* Orders List */}
        <div className="grid gap-4">
          {orders.length > 0 ? (
            <ShippedOrdersList orders={orders} />
          ) : (
            <div className="text-center py-24 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
              <Package
                size={48}
                className="mx-auto text-slate-200 dark:text-slate-800 mb-4"
              />
              <p className="text-slate-500 dark:text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">
                No revenue recorded for {monthName}
              </p>
            </div>
          )}
        </div>

        <footer className="mt-16 text-center text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">
          Instance: {new Date().toLocaleDateString()} • Secure Admin Channel
          2026
        </footer>
      </div>
    </div>
  );
}
