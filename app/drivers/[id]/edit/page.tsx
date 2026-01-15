import { getDriver } from "@/services/driversServices";
import { DriverForm } from "@/components/dashboard/DriverForm";
import { ShieldAlert } from "lucide-react";

export default async function EditDriverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Direct server-side call (cached via unstable_cache in service)
  const driver = await getDriver(id);

  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-20 text-center">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-2">
          <ShieldAlert className="text-rose-500" size={32} />
        </div>
        <h2 className="font-black text-rose-500 uppercase tracking-widest text-lg">
          Access Denied
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
          Driver Credentials Not Found or Nullified
        </p>
      </div>
    );
  }

  return <DriverForm initialData={driver} isEdit />;
}
