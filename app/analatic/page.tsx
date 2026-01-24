import Chart from "./components/chart";
import ChartPieInteractive from "./components/pie";
import SectionCards from "./components/section";
import { ShieldCheck } from "lucide-react";
import OffersPerformance from "@/components/analytics/OffersPerformance";

interface PageProps {
  params: Promise<{ date: string }>;
}

export default async function OverviewPage({ params }: PageProps) {
  const { date } = await params;

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 pb-20">
      {/* Sticky Compact Header */}
      <header className="sticky top-0 z-100 bg-card md:bg-card/80 md:backdrop-blur-md border-b border-border shadow">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-[0.2em] mb-0.5">
                <ShieldCheck size={10} />
                تحليلات النظام
              </div>
              <h1 className="text-xl font-black text-foreground uppercase tracking-tight">
                نظرة عامة على <span className="text-primary">المتجر</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Top Summary Section */}
        <section className="bg-card p-2 rounded shadow border border-border">
          <SectionCards />
        </section>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart - Dominant Panel */}
          <div className="bg-card p-4 rounded shadow border border-border lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded" />
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  مقاييس الإيرادات
                </h3>
              </div>
            </div>
            <div className="w-full">
              <Chart initialDate={date} />
            </div>
          </div>

          {/* Offers Performance - Secondary Panel */}
          <div className="lg:col-span-1">
            <OffersPerformance />
          </div>
        </div>

        {/* Inventory Distribution Section */}
        <section className="bg-card p-4 rounded shadow border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              توزيع المخزون
            </h3>
          </div>
          <div className="max-w-md mx-auto">
            <ChartPieInteractive />
          </div>
        </section>
      </main>

      {/* Decorative System Footer */}
      <footer className="mt-12 text-center">
        <p className="text-xs font-black text-muted-foreground/30 uppercase tracking-[0.5em] select-none">
          نظام التحليل المؤسسي الإصدار 2.0
        </p>
      </footer>
    </div>
  );
}
