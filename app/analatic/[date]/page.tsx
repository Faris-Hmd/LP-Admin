import Chart from "./components/chart";
import ChartPieInteractive from "./components/pie";
import SectionCards from "./components/section";
import { DailySalesData } from "@/types/productsTypes";
import { getOrdersWh } from "@/services/ordersServices";
import { ShieldCheck } from "lucide-react";
import DateSelector from "@/components/DataPicker";
import OffersPerformance from "@/components/analytics/OffersPerformance";

export const revalidate = 60;

export async function generateStaticParams() {
  return [{ date: "2025-12" }, { date: "2025-11" }, { date: "2026-01" }];
}

interface PageProps {
  params: Promise<{ date: string }>;
}

export default async function OverviewPage({ params }: PageProps) {
  const { date } = await params;
  const normalizedDate = date.replace("/", "-");
  const [year, month] = normalizedDate.split("-").map(Number);

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Convert to milliseconds for comparison
  const startMillis = startDate.getTime();
  const endMillis = endDate.getTime();

  console.log("Date range (millis):", startMillis, endMillis);

  // 1. Fetch Global Counts

  // 3. Typed Fetch for Sales Data
  async function getSalesData(): Promise<DailySalesData[]> {
    const deliveredOrders = await getOrdersWh([
      { field: "status", op: "==", val: "Delivered" },
      { field: "deliveredAt", op: ">=", val: startMillis },
      { field: "deliveredAt", op: "<=", val: endMillis },
    ]);

    const statsMap: Record<number, { sales: number; orders: number }> = {};
    deliveredOrders.forEach((order) => {
      let d: Date | null = null;
      if (order.deliveredAt) {
        // Now it's a number (millis)
        d = new Date(order.deliveredAt);
      }

      if (!d) return;
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
    <div className="min-h-screen bg-background transition-colors duration-500 pb-20">
      {/* Sticky Compact Header - Consistent with Add/Update forms */}
      <header className="sticky top-0 z-100 bg-card md:bg-card/80 md:backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
                <ShieldCheck size={10} />
                تحليلات النظام
              </div>
              <h1 className="text-xl font-black text-foreground uppercase tracking-tight">
                نظرة عامة على <span className="text-primary">المتجر</span>
              </h1>
            </div>

            <DateSelector currentMonth={date} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Top Summary Section */}
        <section className="bg-card p-2 rounded shadow-sm border border-border">
          <SectionCards />
        </section>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart - Dominant Panel */}
          <div className="bg-card p-4 rounded shadow-sm border border-border lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded" />
                <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                  مقاييس الإيرادات
                </h3>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground font-mono tracking-tighter">
                {date}
              </span>
            </div>
            <div className="w-full">
              <Chart salesData={salesData} />
            </div>
          </div>

          {/* Inventory Distribution - Secondary Panel */}
          <div className="bg-card p-4 rounded shadow-sm border border-border lg:col-span-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                توزيع المخزون
              </h3>
              <div className="px-2 py-0.5 rounded bg-muted text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                كلي
              </div>
            </div>
            <div className="flex flex-col  items-center justify-center">
              <ChartPieInteractive />
            </div>
          </div>
        </div>

        {/* Offers Performance Section */}
        <OffersPerformance />
      </main>

      {/* Decorative System Footer */}
      <footer className="mt-12 text-center">
        <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.5em] select-none">
          نظام التحليل المؤسسي الإصدار 2.0
        </p>
      </footer>
    </div>
  );
}
