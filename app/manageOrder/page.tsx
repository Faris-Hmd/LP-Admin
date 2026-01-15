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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                ORDER <span className="text-blue-600">MANAGEMENT</span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-wider">
                System Logistics & Fulfillment
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={
                  `/manageOrder/shipped/${new Date().toISOString().slice(0, 7)}` as any
                }
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 dark:border-blue-900/30"
              >
                <History size={16} />
                <span className="hidden md:inline">Logs</span>
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
