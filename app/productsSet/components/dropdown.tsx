"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation"; // Changed from SWR
import {
  product_feature_toggle,
  product_dlt,
} from "@/services/productsServices";
import {
  Edit,
  EllipsisVertical,
  Trash2,
  Star,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function Dropdown({ id, isFeatured }: { id: string; isFeatured: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // --- TOGGLE FEATURE ---
  const handleToggleFeature = () => {
    startTransition(async () => {
      // Execute the Server Action
      await product_feature_toggle(id, isFeatured);

      // Refresh the current route to fetch new data from the server
      router.refresh();
    });
  };

  // --- DELETE PRODUCT ---
  const handleDelete = () => {
    startTransition(async () => {
      // Execute the Server Action
      await product_dlt(id);

      setShowDeleteConfirm(false);

      // Refresh the current route to remove the item from the list
      router.refresh();
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all active:scale-95 outline-none">
            {isPending ? (
              <Loader2 size={18} className="animate-spin text-primary" />
            ) : (
              <EllipsisVertical size={20} />
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="rounded-2xl shadow-xl bg-card border-border min-w-[180px] p-1.5"
        >
          <DropdownMenuItem
            disabled={isPending}
            onClick={handleToggleFeature}
            className="flex gap-3 items-center w-full px-3 py-2.5 rounded-xl cursor-pointer text-sm font-bold text-foreground hover:text-warning hover:bg-warning/10 transition-colors"
          >
            <Star
              size={16}
              className={cn(
                isFeatured
                  ? "fill-warning text-warning"
                  : "text-muted-foreground",
              )}
            />
            <span>{isFeatured ? "إلغاء التمييز" : "تمييز المنتج"}</span>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/productsSet/${id}`}
              className="flex gap-3 items-center w-full px-3 py-2.5 rounded-xl cursor-pointer text-sm font-bold text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Edit size={16} />
              <span>تعديل المنتج</span>
            </Link>
          </DropdownMenuItem>

          <div className="h-px bg-border my-1" />

          <DropdownMenuItem
            disabled={isPending}
            onClick={() => setShowDeleteConfirm(true)}
            className="flex gap-3 items-center w-full px-3 py-2.5 rounded-xl cursor-pointer text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={16} />
            <span>حذف المنتج</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 md:backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-destructive" size={28} />
              </div>
              <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
                حذف المنتج؟
              </h3>
              <p className="text-sm text-muted-foreground mt-2 font-medium leading-relaxed">
                هل أنت متأكد؟ سيتم إزالة هذا العنصر من مخزون المتجر نهائياً.
              </p>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                disabled={isPending}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 rounded-2xl text-xs font-black uppercase text-muted-foreground hover:bg-muted transition-colors"
              >
                إلغاء
              </button>
              <button
                disabled={isPending}
                onClick={handleDelete}
                className="flex-1 px-4 py-3 rounded-2xl text-xs font-black uppercase bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 hover:bg-destructive/90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "تأكيد الحذف"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dropdown;
