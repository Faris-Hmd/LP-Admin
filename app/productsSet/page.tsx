import Link from "next/link";
import { Plus, Package, Star, ShieldCheck } from "lucide-react";
import Dropdown from "./components/dropdown";
import TableSearchForm from "./components/tableSearchForm";
import { getProducts } from "@/services/productsServices";
import { getCategoryLabel } from "@/data/categoryMapping";

export default async function ProductTable({
  searchParams,
}: {
  searchParams: Promise<{ key: string; value: string }>;
}) {
  const { key, value } = await searchParams;
  const products = await getProducts(key as any, value, 20);

  return (
    <div className="min-h-screen bg-background transition-colors pb-20">
      {/* Sticky Compact Header */}
      <header className=" sticky top-0 z-100 bg-card md:bg-card/80 md:backdrop-blur-md border-b border-border shadow">
        <div className="max-w-4xl mx-auto p-3 md:p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-primary uppercase tracking-[0.2em] mb-0.5">
                <ShieldCheck size={10} />
                مخزون النظام
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-foreground uppercase tracking-tight">
                  كتالوج <span className="text-primary">المنتجات</span>
                </h1>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-sm font-black border border-primary/20">
                  {products?.length || 0}
                </span>
              </div>
            </div>
            <Link
              href={"/productsSet/prod_add" as any}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-black py-2 px-4 rounded text-sm uppercase tracking-widest transition-all active:scale-95 shadow shadow-primary/20"
            >
              <Plus size={14} strokeWidth={3} />
              إضافة
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
                className="group bg-card border border-border rounded p-4 flex items-center justify-between hover:border-primary/50 transition-all shadow"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Item Icon */}
                  <div
                    className={`shrink-0 p-3 rounded border ${
                      row.isFeatured
                        ? "bg-warning/10 border-warning/30 text-warning"
                        : "bg-muted border-border text-muted-foreground"
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
                        className="text-sm font-black text-foreground truncate hover:text-primary transition-colors"
                      >
                        {row.p_name}
                      </a>
                      {row.isFeatured && (
                        <Star size={12} className="fill-warning text-warning" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm text-muted-foreground font-black uppercase tracking-widest">
                        {getCategoryLabel(row.p_cat)}
                      </span>
                      <span className="w-1 h-1 rounded bg-border" />
                      <span className="text-sm font-black text-primary">
                        {Number(row.p_cost).toLocaleString()}{" "}
                        <span className="text-sm">SDG</span>
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
            <div className="py-20 text-center border-2 border-dashed border-border rounded">
              <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.4em]">
                الكتالوج فارغ
              </p>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <footer className="mt-12 text-center">
          <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.5em]">
            نهاية القائمة
          </p>
        </footer>
      </div>
    </div>
  );
}
