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
    <div className="min-h-screen bg-background transition-colors duration-500 pb-16">
      {/* Sticky Compact Header - Consistent with Add/Update forms */}
      <header className="sticky top-0 z-100 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-2.5">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-1.5 text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
                <ShieldCheck size={9} />
                تحليلات النظام
              </div>
              <h1 className="text-base font-black text-foreground uppercase tracking-tight">
                نظرة عامة على <span className="text-primary">المتجر</span>
              </h1>
            </div>

            <DateSelector currentMonth={date} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-3 md:p-5 space-y-4">
        {/* Top Summary Section */}
        <section className="bg-card p-3 md:p-4 rounded-xl shadow-sm border border-border">
          <div className="flex items-center gap-1.5 mb-3">
            <LayoutDashboard size={12} className="text-primary" />
            <h2 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              مؤشرات الأداء الرئيسية
            </h2>
          </div>
          <SectionCards />
        </section>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Chart - Dominant Panel */}
          <div className="bg-card p-3 md:p-4 rounded-xl shadow-sm border border-border lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-0.5 h-3 bg-primary rounded-full" />
                <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  مقاييس الإيرادات
                </h3>
              </div>
              <span className="text-[8px] font-bold text-muted-foreground font-mono tracking-tighter">
                {date}
              </span>
            </div>
            <div className="w-full">
              <Chart salesData={salesData} />
            </div>
          </div>

          {/* Inventory Distribution - Secondary Panel */}
          <div className="bg-card p-3 md:p-4 rounded-xl shadow-sm border border-border lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                توزيع المخزون
              </h3>
              <div className="px-1.5 py-0.5 rounded bg-muted text-[8px] font-black text-muted-foreground uppercase tracking-tighter">
                كلي
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <ChartPieInteractive />
            </div>
          </div>
        </div>
      </main>

      {/* Decorative System Footer */}
      <footer className="mt-8 text-center">
        <p className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-[0.5em] select-none">
          نظام التحليل المؤسسي الإصدار 2.0
        </p>
      </footer>
    </div>
  );
}
