import Chart from "./components/chart";
import { Timestamp } from "firebase/firestore";
import ChartPieInteractive from "./components/pie";
import SectionCards from "./components/section";
import { DailySalesData } from "@/types/productsTypes";
import { getOrdersWhOrdered } from "@/services/ordersServices";
import { LayoutDashboard, ShieldCheck } from "lucide-react";
import DateSelector from "@/components/DataPicker";

export const revalidate = 60;

export async function generateStaticParams() {
  return [{ date: "2025-12" }, { date: "2025-11" }, { date: "2026-01" }];
}

interface PageProps {
  params: Promise<{ date: string }>;
}

export default async function OverviewPage({ params }: PageProps) {
  const { date } = await params;
  const [year, month] = date.split("-").map(Number);

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // 1. Fetch Global Counts

  // 3. Typed Fetch for Sales Data
  async function getSalesData(): Promise<DailySalesData[]> {
    const deliveredOrders = await getOrdersWhOrdered([
      { field: "status", op: "==", val: "Delivered" },
      { field: "deleveratstamp", op: ">=", val: Timestamp.fromDate(startDate) },
      { field: "deleveratstamp", op: "<=", val: Timestamp.fromDate(endDate) },
    ]);

    const statsMap: Record<number, { sales: number; orders: number }> = {};
    deliveredOrders.forEach((order) => {
      if (!order.deliveredAt) return;
      const d = new Date(order.deliveredAt);
      const day = d.getDate();

      const orderTotal = (order.productsList || []).reduce(
        (sum: number, item) =>
          sum + (Number(item.p_cost) * Number(item.p_qu) || 0),
        0,
      );

      if (!statsMap[day]) {
        statsMap[day] = { sales: 0, orders: 0 };
      }

      statsMap[day].sales += orderTotal;
      statsMap[day].orders += 1;
    });

    const daysInMonth = new Date(year, month, 0).getDate();
    const finalData: DailySalesData[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      finalData.push({
        month: date,
        day: i,
        sales: statsMap[i]?.sales || 0,
        orders: statsMap[i]?.orders || 0,
      });
    }
    return finalData;
  }

  const [salesData] = await Promise.all([getSalesData()]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 pb-20">
      {/* Sticky Compact Header - Consistent with Add/Update forms */}
      <header className="sticky top-0 z-100 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-0.5">
                <ShieldCheck size={10} />
                System Analytics
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Store <span className="text-blue-600">Overview</span>
              </h1>
            </div>

            <DateSelector currentMonth={date} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Top Summary Section */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <LayoutDashboard size={14} className="text-blue-600" />
            <h2 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Operational KPIs
            </h2>
          </div>
          <SectionCards />
        </section>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart - Dominant Panel */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                <h3 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Revenue Metrics
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">
                {date}
              </span>
            </div>
            <div className="w-full">
              <Chart salesData={salesData} />
            </div>
          </div>

          {/* Inventory Distribution - Secondary Panel */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-1">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Stock Allocation
              </h3>
              <div className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                Global
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <ChartPieInteractive />
            </div>
          </div>
        </div>
      </main>

      {/* Decorative System Footer */}
      <footer className="mt-12 text-center">
        <p className="text-[8px] font-black text-slate-200 dark:text-slate-800 uppercase tracking-[0.5em] select-none">
          Enterprise Analytical Terminal v2.0
        </p>
      </footer>
    </div>
  );
}
