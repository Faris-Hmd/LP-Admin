import Link from "next/link";
import { Plus, Tag, ShieldCheck, Trash2, Edit } from "lucide-react";
import { getOffers } from "@/services/offersServices";
import Image from "next/image";
import DeleteOfferBtn from "@/components/offers/DeleteOfferBtn";
export const dynamic = "force-dynamic";
export default async function OffersTable() {
  const offers = await getOffers();

  return (
    <div className="min-h-screen bg-background transition-colors pb-20">
      {/* Sticky Compact Header */}
      <header className="sticky top-0 z-20 bg-card md:bg-card/80 md:backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto p-3 md:p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-tiny font-black text-primary uppercase tracking-[0.2em] mb-0.5">
                <ShieldCheck size={10} />
                إدارة العروض
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-foreground uppercase tracking-tight">
                  قائمة <span className="text-primary">العروض</span>
                </h1>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-tiny font-black border border-primary/20">
                  {offers?.length || 0}
                </span>
              </div>
            </div>
            <Link
              href={"/offersSet/add" as any}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-black py-2 px-4 rounded text-tiny uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              <Plus size={14} strokeWidth={3} />
              إضافة عرض
            </Link>
          </div>
        </div>
      </header>

      {/* Offers Grid/List */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4">
          {offers?.length > 0 ? (
            offers.map((offer) => (
              <div
                key={offer.id}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all shadow-sm flex flex-row h-38 md:h-40"
              >
                <div className="w-32 md:w-48 shrink-0 p-2">
                  <div className="relative w-full h-full rounded-xl overflow-hidden shadow-sm">
                    <Image
                      src={offer.image || "/placeholder.png"}
                      alt={offer.title}
                      fill
                      sizes="(max-width: 768px) 30vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>

                {/* Offer Info */}
                <div className="p-3 md:p-4 flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {offer.badge && (
                        <span className="mb-1 inline-block px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded border border-primary/20">
                          {offer.badge}
                        </span>
                      )}
                      <h3 className="text-sm md:text-base font-black text-foreground truncate group-hover:text-primary transition-colors">
                        {offer.title}
                      </h3>
                      <p className="text-[10px] md:text-xs text-muted-foreground font-medium line-clamp-2 mt-1">
                        {offer.description}
                      </p>
                    </div>
                    <span className="text-sm font-black text-primary shrink-0">
                      {offer.price} <span className="text-[9px]">ج.س</span>
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between mt-auto">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                      {offer.products?.length || 0} منتجات
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/offersSet/${offer.id}` as any}
                        className="p-1.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20"
                      >
                        <Edit size={14} />
                      </Link>
                      <DeleteOfferBtn id={offer.id} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-2xl">
              <Tag
                size={40}
                className="mx-auto text-muted-foreground/30 mb-4"
              />
              <p className="text-tiny font-black text-muted-foreground uppercase tracking-[0.4em]">
                لا توجد عروض حالياً
              </p>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <footer className="mt-12 text-center">
          <p className="text-tiny font-black text-muted-foreground uppercase tracking-[0.5em]">
            نهاية القائمة
          </p>
        </footer>
      </div>
    </div>
  );
}
