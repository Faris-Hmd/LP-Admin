"use client";
import React, { useState, useTransition, useEffect, useMemo } from "react";
import {
  Package,
  ChevronDown,
  ChevronUp,
  Settings2,
  BadgePercent,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { delOrder } from "@/services/ordersServices";
import {
  onSnapshot,
  query,
  where,
  Timestamp,
  getFirestore,
  collection,
} from "firebase/firestore";
import { getApps, getApp, initializeApp } from "firebase/app";

export default function OrderListClient({
  firebaseConfig,
}: {
  firebaseConfig: any;
}) {
  const [isPending, startTransition] = useTransition();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {},
  );

  const isFirstLoad = React.useRef(true);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio instance with Base64 to avoid network blocks
    audioRef.current = new Audio(
      "data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7cZb/96633/u//53f//juhb4Yd1F5/97/+976qxr757//p3vV6q9575///53v/75////9//93//52f/47///47////47wY7/+973///973///973/3vf/3vf/3vf/3v/////3ve9///3ve9//ve9//ve9///3ve9//ve9///////73ve////3ve9//ve9//ve9//ve9//ve9//ve9//ve9///////73ve////3ve9//ve9//ve9//ve9//ve9//ve9//ve9///////73ve////3ve9//ve9//ve9//ve9//ve9//ve9//ve9///////73ve",
    );
  }, []);

  // Initialize Firebase App for this client component instance
  const db = useMemo(() => {
    if (!firebaseConfig) return null;
    try {
      const app =
        getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      return getFirestore(app);
    } catch (e) {
      console.error("Firebase init error", e);
      return null;
    }
  }, [firebaseConfig]);

  useEffect(() => {
    if (!db) {
      setError("فشل تهيئة الاتصال بقاعدة البيانات");
      setIsLoading(false);
      return;
    }

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("status", "in", ["Processing", "Shipped"]),
    );

    console.log("Starting listener on orders...");

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Check for new additions
        if (!isFirstLoad.current) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const newOrder = change.doc.data();
              toast.success(`طلب جديد: ${newOrder.totalAmount} SDG`, {
                duration: 5000,
                icon: <Package className="text-primary" />,
              });

              // Play sound
              if (audioRef.current) {
                audioRef.current
                  .play()
                  .catch((e) => console.log("Audio play failed", e));
              }
            }
          });
        }

        const updatedOrders = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toMillis()
                : typeof data.createdAt === "number"
                  ? data.createdAt
                  : 0,
            deliveredAt:
              data.deliveredAt instanceof Timestamp
                ? data.deliveredAt.toMillis()
                : typeof data.deliveredAt === "number"
                  ? data.deliveredAt
                  : 0,
          };
        });
        setOrders(updatedOrders);
        console.log("Orders updated:", updatedOrders.length);
        setIsLoading(false);
        setError(null);
        isFirstLoad.current = false;
      },
      (err) => {
        console.error("Firestore subscription error:", err);
        setError(
          "فشل في تحميل البيانات. " +
            (err.code === "permission-denied"
              ? "ليس لديك صلاحية الوصول."
              : "خطأ في الاتصال."),
        );
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [db]);

  const sortedOrders = [...orders].sort((a, b) => {
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleDelete = async (orderId: string) => {
    if (!window.confirm("هل تريد حذف هذا الطلب نهائياً؟")) return;

    startTransition(async () => {
      try {
        await delOrder(orderId);
        toast.success("تم حذف الطلب بنجاح");
        // No need to refresh router as onSnapshot will update the list
      } catch (err) {
        toast.error("فشلت العملية");
      }
    });
  };

  const formatDateArabic = (date: any) => {
    if (!date) return "";
    let d: Date;
    if (date && typeof date.toDate === "function") {
      d = date.toDate();
    } else if (typeof date === "string" || typeof date === "number") {
      d = new Date(date);
    } else if (date instanceof Date) {
      d = date;
    } else {
      return "";
    }

    if (isNaN(d.getTime())) return "";

    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-destructive/10 rounded-3xl border-2 border-dashed border-destructive/20">
        <Package size={40} className="mx-auto text-destructive mb-4" />
        <p className="text-sm font-bold text-destructive">{error}</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-20 bg-card rounded-3xl border-2 border-dashed border-border">
        <Package size={40} className="mx-auto text-muted-foreground mb-4" />
        <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.3em]">
          قائمة الانتظار فارغة
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-2 relative">
      {sortedOrders.map((order) => {
        const isExpanded = expandedOrders[order.id];
        const totalItems = order.productsList.reduce(
          (sum: number, p: any) => sum + (Number(p.p_qu) || 0),
          0,
        );

        return (
          <div
            key={order.id}
            className={cn(
              "bg-card border rounded transition-all duration-200 overflow-hidden",
              isExpanded
                ? "ring-2 ring-primary/20 border-primary/50 shadow"
                : "border-border",
            )}
          >
            <div className="p-2.5 flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg shrink-0",
                  isExpanded
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Package size={20} />
              </div>

              <div className="flex-1 min-w-0">
                {/* Top Row: Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-sm font-black uppercase tracking-widest px-2 py-1 rounded-md border",
                      order.status === "Processing"
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        : "bg-warning/10 text-warning border-warning/20",
                    )}
                  >
                    {order.status === "Processing"
                      ? "قيد المعالجة"
                      : "تم الشحن"}
                  </span>
                  {order.isOffer && (
                    <span className="text-sm font-black uppercase tracking-widest px-2 py-1 rounded-md border bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                      <BadgePercent size={12} />
                      عرض خاص
                    </span>
                  )}
                </div>

                {/* Middle: Amount */}
                <p className="text-xl font-black text-foreground mb-0.5 leading-none">
                  {order.totalAmount.toLocaleString()}{" "}
                  <span className="text-sm text-primary">SDG</span>
                </p>

                {/* Bottom Row: Metadata (ID & Date) */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm font-bold uppercase tracking-wider bg-muted/50 px-1.5 py-0.5 rounded">
                    #{order.id.slice(-6).toUpperCase()}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-sm font-bold uppercase tracking-tight">
                    {formatDateArabic(order.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/manageOrder/${order.id}` as any}
                  className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Settings2 size={16} />
                </Link>
                <button
                  onClick={() => toggleOrder(order.id)}
                  className="p-2 hover:bg-muted rounded-full transition-colors cursor-pointer"
                >
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={20} className="text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="px-3 pb-3 bg-muted/20 border-t border-border">
                <div className="py-2.5 space-y-1.5">
                  {order.isOffer ? (
                    <div className="bg-card p-2 rounded-lg border border-primary/20 bg-primary/5 flex justify-between items-center shadow">
                      <div className="flex items-center gap-3">
                        {order.offerImage && (
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-muted relative">
                            <img
                              src={order.offerImage}
                              alt={order.offerTitle}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-black text-foreground uppercase truncate">
                            {order.offerTitle}
                          </p>
                          <p className="text-sm text-primary/80 font-bold uppercase tracking-widest flex items-center gap-1">
                            <BadgePercent size={10} />
                            عرض توفير خاص
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    order.productsList.map((p: any) => (
                      <div
                        key={p.id}
                        className="bg-card p-2 rounded-lg border border-border flex justify-between items-center shadow"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-black text-foreground uppercase truncate">
                            {p.p_name}
                          </p>
                          <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
                            الكمية: {p.p_qu} @{" "}
                            {Number(p.p_cost).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm font-black text-primary">
                          {(Number(p.p_cost) * Number(p.p_qu)).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(order.id);
                    }}
                    className="text-sm font-black uppercase tracking-[0.2em] text-destructive hover:scale-105 transition-transform"
                  >
                    {isPending ? "جاري الحذف..." : "[ حذف الطلب ]"}
                  </button>
                  <p className="text-sm font-black text-muted-foreground uppercase">
                    معاملة مصرح بها
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
