import Link from "next/link";
import { Plus, Tag, Sparkles, ShieldCheck, Trash2, Edit } from "lucide-react";
import { getOffers } from "@/services/offersServices";
import Image from "next/image";

export default async function OffersTable() {
  const offers = await getOffers();

  return (
    <div className="min-h-screen bg-background transition-colors pb-20">
      {/* Sticky Compact Header */}
      <header className="sticky top-0 z-100 bg-card md:bg-card/80 md:backdrop-blur-md border-b border-border shadow-sm">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {offers?.length > 0 ? (
            offers.map((offer) => (
              <div
                key={offer.id}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all shadow-sm flex flex-col"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={offer.image || "/placeholder.png"}
                    alt={offer.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {offer.badge && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-primary text-primary-foreground text-tiny font-black uppercase tracking-widest rounded-full shadow-lg">
                        {offer.badge}
                      </span>
                    </div>
                  )}
                </div>

                {/* Offer Info */}
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">
                      {offer.title}
                    </h3>
                    <span className="text-xs font-black text-primary">
                      {offer.price} <span className="text-tiny">جنية</span>
                    </span>
                  </div>
                  <p className="text-tiny text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                    {offer.description}
                  </p>
                  <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-tiny text-muted-foreground font-bold uppercase tracking-tighter">
                      {offer.products?.length || 0} منتجات
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/offersSet/${offer.id}` as any}
                        className="p-2 bg-muted hover:bg-primary/10 hover:text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20"
                      >
                        <Edit size={14} />
                      </Link>
                      {/* Delete would probably need a client component for confirmation, or an action directly */}
                      <button className="p-2 bg-muted hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors border border-transparent hover:border-destructive/20">
                        <Trash2 size={14} />
                      </button>
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
