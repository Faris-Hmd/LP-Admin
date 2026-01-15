import { getProduct } from "@/data/productsData";
import UpdateForm from "./components/updateform";
import { ShieldCheck } from "lucide-react";

export async function UpdateFormPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-20">
      {/* Sticky Compact Header - Matching Product Table Style */}
      <header className="sticky top-0 z-100 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-0.5">
                <ShieldCheck size={10} />
                Editor Mode
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Modify <span className="text-blue-600">Product</span>
              </h1>
            </div>

            {/* Visual Indicator of Current Product ID */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Database ID
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">
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
        <p className="text-[8px] font-black text-slate-200 dark:text-slate-800 uppercase tracking-[0.5em] select-none">
          Secure Modification Channel
        </p>
      </footer>
    </div>
  );
}

export default UpdateFormPage;
