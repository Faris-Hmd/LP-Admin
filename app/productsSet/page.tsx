import Link from "next/link";
import { Plus, Package, Star, ShieldCheck } from "lucide-react";
import Dropdown from "./components/dropdown";
import TableSearchForm from "./components/tableSearchForm";
import { getProducts } from "@/data/productsData";

export default async function ProductTable({
  searchParams,
}: {
  searchParams: Promise<{ key: string; value: string }>;
}) {
  const { key, value } = await searchParams;
  const products = await getProducts(key as any, value, 20);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-20">
      {/* Sticky Compact Header */}
      <header className=" sticky top-0 z-100  bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-0.5">
                <ShieldCheck size={10} />
                System Inventory
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Product <span className="text-blue-600">Catalog</span>
              </h1>
            </div>
            <Link
              href={"/productsSet/prod_add" as any}
              className="flex items-center gap-2 bg-blue-600 text-white font-black py-2 px-4 rounded-lg text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              <Plus size={14} strokeWidth={3} />
              Add
            </Link>
          </div>
          <TableSearchForm />
        </div>
      </header>

      {/* Natural Scrolling List */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex flex-col gap-3">
          {products?.length > 0 ? (
            products.map((row) => (
              <div
                key={row.id}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-blue-500/50 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Item Icon */}
                  <div
                    className={`shrink-0 p-3 rounded-lg border ${
                      row.isFeatured
                        ? "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 text-amber-500"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400"
                    }`}
                  >
                    <Package size={18} />
                  </div>

                  {/* Item Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <a
                        href={
                          "https://sudan-pc-shop.vercel.app/products/" + row.id
                        }
                        className="text-sm font-black text-slate-900 dark:text-white truncate hover:text-blue-600 transition-colors"
                      >
                        {row.p_name}
                      </a>
                      {row.isFeatured && (
                        <Star
                          size={12}
                          className="fill-amber-500 text-amber-500"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                        {row.p_cat}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="text-[10px] font-black text-blue-600">
                        {Number(row.p_cost).toLocaleString()}{" "}
                        <span className="text-[8px]">SDG</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Controls */}
                <div className="flex items-center gap-2">
                  <Dropdown id={row.id} isFeatured={row.isFeatured || false} />
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">
                Empty Catalog
              </p>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <footer className="mt-12 text-center">
          <p className="text-[8px] font-black text-slate-300 dark:text-slate-800 uppercase tracking-[0.5em]">
            End of Database Row Transmission
          </p>
        </footer>
      </div>
    </div>
  );
}
