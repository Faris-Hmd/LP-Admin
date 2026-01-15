import { getOrdersWh } from "@/services/ordersServices";
import { History } from "lucide-react";
import Link from "next/link";
import OrderListClient from "@/components/dashboard/OrderListClient";

export default async function ManageOrdersPage() {
  // Fetch data directly on the server
  const orders = await getOrdersWh([
    { field: "status", op: "!=", val: "Delivered" },
  ]);

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                إدارة <span className="text-primary">الطلبات</span>
              </h1>
              <p className="text-[11px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">
                الخدمات اللوجستية والتنفيذ
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={
                  `/manageOrder/shipped/${new Date().toISOString().slice(0, 7)}` as any
                }
                className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20"
              >
                <History size={16} />
                <span className="hidden md:inline">السجلات</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-2 py-8">
        {/* Pass server data to the Client Component for interactivity */}
        <OrderListClient initialOrders={orders} />
      </div>
    </div>
  );
}
