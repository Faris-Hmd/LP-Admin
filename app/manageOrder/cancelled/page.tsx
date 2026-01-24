import { XCircle, Package } from "lucide-react";
import Link from "next/link";
import { getOrdersWh } from "@/services/ordersServices";
import CancelledOrdersList from "@/components/dashboard/cancelledOrdersList";

export const revalidate = 60;

export default async function CancelledOrdersPage() {
  const orders = await getOrdersWh([
    { field: "status", op: "==", val: "Cancelled" },
  ]);

  const totalOrderCount = orders.length;
  const totalLostVolume = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );

  return (
    <div className="min-h-screen bg-transparent pb-32">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase">
                الطلبات <span className="text-destructive">الملغية</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/manageOrder` as any}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-black uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20 whitespace-nowrap"
              >
                <Package size={16} />
                <span className="hidden md:inline">قائمة الانتظار</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* --- SUMMARY STATS --- */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Lost Revenue Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-destructive rounded-2xl blur-md opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative bg-card border border-border p-3.5 rounded-xl shadow-sm overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-destructive/10 rounded-lg">
                    <XCircle size={16} className="text-destructive" />
                  </div>
                  <p className="text-sm font-black uppercase text-muted-foreground tracking-widest">
                    القيمة المفقودة
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl font-black text-foreground tracking-tight">
                    {totalLostVolume.toLocaleString()}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground uppercase leading-none">
                    جنيه سوداني
                  </p>
                </div>
              </div>
              <XCircle className="absolute right-2 bottom-2 size-16 text-destructive/5 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>

          {/* Cancelled Count Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-muted rounded-2xl blur-md opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-card border border-border p-3.5 rounded-xl shadow-sm overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-muted rounded-lg">
                    <Package size={16} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-black uppercase text-muted-foreground tracking-widest">
                    إجمالي الملغي
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl font-black text-foreground tracking-tight">
                    {totalOrderCount}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground uppercase leading-none">
                    طلب ملغي
                  </p>
                </div>
              </div>
              <Package className="absolute right-2 bottom-2 size-16 text-muted-foreground/5 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="grid gap-4">
          {orders.length > 0 ? (
            <CancelledOrdersList orders={orders} />
          ) : (
            <div className="text-center py-24 bg-card border-2 border-dashed border-border rounded-[2.5rem]">
              <XCircle
                size={48}
                className="mx-auto text-muted-foreground mb-4"
              />
              <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-sm">
                لا توجد طلبات ملغية في الأرشيف
              </p>
            </div>
          )}
        </div>

        <footer className="mt-16 text-center text-sm font-black text-muted-foreground uppercase tracking-[0.4em]">
          تاريخ: {new Date().toLocaleDateString("ar-EG")} • سجلات النظام
          النهائية
        </footer>
      </div>
    </div>
  );
}
