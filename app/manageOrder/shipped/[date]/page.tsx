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
    <div className="min-h-screen bg-transparent pb-32">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase">
                الطلبات <span className="text-primary">المشحونة</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 mt-1">
                <DateSelector currentMonth={date} />
              </div>
              <Link
                href={`/manageOrder` as any}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20 whitespace-nowrap"
              >
                <Package size={16} />
                <span className="hidden md:inline">قائمة الانتظار</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* --- SUMMARY STATS --- */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
          <div className="bg-primary p-8 rounded-[2rem] shadow-xl shadow-primary/20 text-primary-foreground relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase opacity-70 tracking-[0.2em] mb-2">
                الإيرادات الشهرية
              </p>
              <p className="text-2xl md:text-3xl font-black tracking-tighter">
                {totalSalesVolume.toLocaleString()}{" "}
                <span className="text-sm font-bold opacity-60">ج.س</span>
              </p>
            </div>
            <CheckCircle2 className="absolute right-[-10px] bottom-[-10px] size-32 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>

          <div className="bg-card border border-border p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-2">
              إجمالي الشحنات
            </p>
            <p className="text-xl md:text-2xl font-black text-foreground tracking-tighter">
              {totalOrderCount}{" "}
              <span className="text-sm font-bold text-muted-foreground">
                طلبات
              </span>
            </p>
          </div>
        </div>

        {/* Orders List */}
        <div className="grid gap-4">
          {orders.length > 0 ? (
            <ShippedOrdersList orders={orders} />
          ) : (
            <div className="text-center py-24 bg-card border-2 border-dashed border-border rounded-[2.5rem]">
              <Package
                size={48}
                className="mx-auto text-muted-foreground mb-4"
              />
              <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px]">
                لا توجد إيرادات مسجلة لشهر {monthName}
              </p>
            </div>
          )}
        </div>

        <footer className="mt-16 text-center text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">
          تاريخ: {new Date().toLocaleDateString("ar-EG")} • قناة الإدارة الآمنة
          2026
        </footer>
      </div>
    </div>
  );
}
