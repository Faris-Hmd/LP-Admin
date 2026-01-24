import Link from "next/link";
import { Plus, Tag, ShieldCheck, Trash2, Edit } from "lucide-react";
import { getOffers } from "@/services/offersServices";
import Image from "next/image";
import DeleteOfferBtn from "@/components/offers/DeleteOfferBtn";
import SeedOffersButton from "@/components/offers/SeedOffersButton";
export default async function OffersTable() {
  const offers = await getOffers();

  return (
    <div className="min-h-screen bg-background transition-colors pb-20">
      {/* Sticky Compact Header */}
      <header className="sticky top-0 z-100 bg-card md:bg-card/80 md:backdrop-blur-md border-b border-border shadow">
        <div className="max-w-4xl mx-auto p-3 md:p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-primary uppercase tracking-[0.2em] mb-0.5">
                <ShieldCheck size={10} />
                إدارة العروض
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-foreground uppercase tracking-tight">
                  قائمة <span className="text-primary">العروض</span>
                </h1>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-black border border-primary/20">
                  {offers?.length || 0}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {process.env.NODE_ENV === "development" && <SeedOffersButton />}
              <Link
                href={"/offersSet/add" as any}
                className="flex items-center gap-2 bg-primary text-primary-foreground font-black py-2 px-4 rounded text-sm uppercase tracking-widest transition-all active:scale-95 shadow shadow-primary/20"
              >
                <Plus size={14} strokeWidth={3} />
                إضافة عرض
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Offers Grid/List */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4">
          {offers?.length > 0 ? (
            offers.map((offer) => {
              const originalPrice =
                offer.products?.reduce(
                  (sum, p) => sum + (Number(p.p_cost) || 0),
                  0,
                ) || 0;
              const savings = originalPrice - (offer.price || 0);

              return (
                <div
                  key={offer.id}
                  className="group bg-card border border-border rounded p-4 flex items-center justify-between hover:border-primary/50 transition-all shadow flex flex-row h-38 md:h-40"
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
                          <span className="mb-1 inline-block px-1.5 py-0.5 bg-primary/10            text-sm text-destructive font-black uppercase tracking-wider mb-1st rounded border border-primary/20">
                            {offer.badge}
                          </span>
                        )}
                        <h3 className="text-sm md:text-base font-black text-foreground truncate group-hover:text-primary transition-colors">
                          {offer.title}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium line-clamp-2 mt-1">
                          {offer.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-sm font-black text-primary">
                          {offer.price} <span className="text-xs">ج.س</span>
                        </span>
                        {savings > 0 && (
                          <span className="text-xs text-green-600 font-bold">
                            وفر {savings.toFixed(0)}{" "}
                            <span className="text-sm text-primary">SDG</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between mt-auto">
                      <span className="text-sm text-muted-foreground font-black uppercase tracking-widest">
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
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-2xl">
              <Tag
                size={40}
                className="mx-auto text-muted-foreground/30 mb-4"
              />
              <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.4em]">
                لا توجد عروض حالياً
              </p>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <footer className="mt-12 text-center">
          <p className="text-sm font-black text-red-500 uppercase tracking-[0.5em]">
            نهاية القائمة
          </p>
        </footer>
      </div>
    </div>
  );
}
