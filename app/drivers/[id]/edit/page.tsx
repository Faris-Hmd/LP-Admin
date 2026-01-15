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
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-2">
          <ShieldAlert className="text-destructive" size={32} />
        </div>
        <h2 className="font-black text-destructive uppercase tracking-widest text-lg">
          تم رفض الوصول
        </h2>
        <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">
          بيانات السائق غير موجودة أو ملغاة
        </p>
      </div>
    );
  }

  return <DriverForm initialData={driver} isEdit />;
}
