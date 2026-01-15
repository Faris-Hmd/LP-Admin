import { Edit2, Phone, Plus, Truck } from "lucide-react";
import Link from "next/link";
import { getDrivers } from "@/services/driversServices";
import { Driver } from "@/types/userTypes";

export default async function DriversPage() {
  const drivers = await getDrivers();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-black uppercase tracking-tight dark:text-white">
            Fleet <span className="text-blue-600">Network</span>
          </h1>
          <Link
            href={"/drivers/add" as any}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20"
          >
            <Plus size={14} /> Add Driver
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
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
    >
      <div className="p-4 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
        <span
          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
            driver.status === "Active"
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : "bg-slate-100 text-slate-400 border-slate-200"
          }`}
        >
          {driver.status}
        </span>
        <div className="flex gap-1">
          <Link
            href={`/drivers/${driver.id}/edit` as any}
            className="p-1.5 hover:text-blue-600 dark:text-slate-400"
          >
            <Edit2 size={14} />
          </Link>
        </div>
      </div>

      <div className="p-5 flex items-center gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-blue-600">
          <Truck size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-black uppercase dark:text-white truncate">
            {driver.name}
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {driver.vehicle}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
          <Phone size={12} /> {driver.phone}
        </div>
        <span className="text-[10px] font-black text-blue-600">
          {driver.currentOrders?.length || 0} Tasks
        </span>
      </div>
    </div>
  );
}
