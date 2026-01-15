import { Edit2, Phone, Plus, Truck } from "lucide-react";
import Link from "next/link";
import { getDrivers } from "@/services/driversServices";
import { Driver } from "@/types/userTypes";

export default async function DriversPage() {
  const drivers = await getDrivers();
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border sticky top-0 z-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-black uppercase tracking-tight text-foreground">
            شبكة <span className="text-primary">التوصيل</span>
          </h1>
          <Link
            href={"/drivers/add" as any}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            <Plus size={14} /> إضافة سائق
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers?.map((driver) => (
            <DriverCard key={driver.id} driver={driver} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DriverCard({ driver }: { driver: Driver }) {
  return (
    <div
      key={driver.id}
      className="bg-card rounded-xl border border-border overflow-hidden shadow-sm"
    >
      <div className="p-4 flex justify-between items-center bg-muted/50 border-b border-border">
        <span
          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
            driver.status === "Active"
              ? "bg-success/10 text-success border-success/20"
              : "bg-muted text-muted-foreground border-border"
          }`}
        >
          {driver.status === "Active" ? "نشط" : driver.status}
        </span>
        <div className="flex gap-1">
          <Link
            href={`/drivers/${driver.id}/edit` as any}
            className="p-1.5 hover:text-primary text-muted-foreground"
          >
            <Edit2 size={14} />
          </Link>
        </div>
      </div>

      <div className="p-5 flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-lg text-primary">
          <Truck size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-black uppercase text-foreground truncate">
            {driver.name}
          </h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            {driver.vehicle}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
          <Phone size={12} /> {driver.phone}
        </div>
        <span className="text-[10px] font-black text-primary">
          {driver.currentOrders?.length || 0} مهام
        </span>
      </div>
    </div>
  );
}
