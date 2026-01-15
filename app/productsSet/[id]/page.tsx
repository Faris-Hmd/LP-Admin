import { getProduct } from "@/data/productsData";
import UpdateForm from "./components/updateform";
import { ShieldCheck } from "lucide-react";

export async function UpdateFormPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) return null;

  return (
    <div className="min-h-screen bg-transparent transition-colors pb-20">
      {/* Sticky Compact Header - Matching Product Table Style */}
      <header className="sticky top-0 z-100 bg-card/80 backdrop-blur-md border-b border-border shadow-sm mb-6">
        <div className="max-w-4xl mx-auto p-3 md:p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
                <ShieldCheck size={10} />
                وضع المحرر
              </div>
              <h1 className="text-xl font-black text-foreground uppercase tracking-tight">
                تعديل <span className="text-primary">المنتج</span>
              </h1>
            </div>

            {/* Visual Indicator of Current Product ID */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                معرف قاعدة البيانات
              </span>
              <span className="text-[10px] font-bold text-muted-foreground font-mono">
                {id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* The Updated Form */}
      <main className="px-2">
        <UpdateForm product={product} />
      </main>

      {/* Background Subtle Label */}
      <footer className="mt-12 text-center">
        <p className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.5em] select-none">
          قناة التعديل الآمنة
        </p>
      </footer>
    </div>
  );
}

export default UpdateFormPage;
