import { Package, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import DateSelector from "@/components/DataPicker";
import { getOrdersWh } from "@/services/ordersServices";
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
  // Support both 2026-01 and 2026/01 formats
  const normalizedDate = dateStr.replace("/", "-");
  const [year, month] = normalizedDate.split("-").map(Number);

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Convert to milliseconds for comparison
  const startMillis = startDate.getTime();
  const endMillis = endDate.getTime();

  return await getOrdersWh([
    { field: "status", op: "==", val: "Delivered" },
    { field: "deliveredAt", op: ">=", val: startMillis },
    { field: "deliveredAt", op: "<=", val: endMillis },
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

  /* const orders = await getMonthlyDeliveredOrders(date); */
  // Fix: Move fetching logic or reuse parsing
  const normalizedDate = date.replace("/", "-");
  const [year, month] = normalizedDate.split("-");
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
                className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20 whitespace-nowrap"
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
        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 mb-4">
          {/* Revenue Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-lg blur-md opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-gradient-to-br from-primary to-primary/90 p-2.5 rounded-lg shadow-lg border border-primary/20 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-white/10 backdrop-blur-sm rounded-md">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                    <p className="text-xs font-black uppercase text-white/70 tracking-[0.1em]">
                      الإيرادات الشهرية
                    </p>
                  </div>
                </div>

                <div className="space-y-0">
                  <p className="text-xl md:text-2xl font-black text-white tracking-tight leading-none">
                    {totalSalesVolume.toLocaleString()}
                  </p>
                  <p className="text-xs font-bold text-white/60 mt-0.5">
                    جنيه سوداني
                  </p>
                </div>
              </div>

              {/* Decorative Icon */}
              <CheckCircle2 className="absolute right-2 bottom-2 size-12 text-white/5 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>

          {/* Orders Count Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-muted rounded-lg blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative bg-card border-2 border-border p-2.5 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-primary rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-primary/10 rounded-md">
                      <Package size={12} className="text-primary" />
                    </div>
                    <p className="text-xs font-black uppercase text-muted-foreground tracking-[0.1em]">
                      إجمالي الشحنات
                    </p>
                  </div>
                </div>

                <div className="space-y-0">
                  <p className="text-xl md:text-2xl font-black text-foreground tracking-tight leading-none">
                    {totalOrderCount}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground mt-0.5">
                    طلب مكتمل
                  </p>
                </div>
              </div>

              {/* Decorative Icon */}
              <Package className="absolute right-2 bottom-2 size-12 text-muted-foreground/5 group-hover:scale-110 transition-transform duration-500" />
            </div>
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
              <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-xs">
                لا توجد إيرادات مسجلة لشهر {monthName}
              </p>
            </div>
          )}
        </div>

        <footer className="mt-16 text-center text-xs font-black text-muted-foreground uppercase tracking-[0.4em]">
          تاريخ: {new Date().toLocaleDateString("ar-EG")} • قناة الإدارة الآمنة
          2026
        </footer>
      </div>
    </div>
  );
}
