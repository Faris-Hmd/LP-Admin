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
          <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95 outline-none">
            {isPending ? (
              <Loader2 size={18} className="animate-spin text-blue-600" />
            ) : (
              <EllipsisVertical size={20} />
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="rounded-2xl shadow-xl dark:bg-slate-900 dark:border-slate-800 min-w-[180px] p-1.5 border-slate-100 dark:border-slate-800"
        >
          <DropdownMenuItem
            disabled={isPending}
            onClick={handleToggleFeature}
            className="flex gap-3 items-center w-full px-3 py-2.5 rounded-xl cursor-pointer text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/40 transition-colors"
          >
            <Star
              size={16}
              className={cn(
                isFeatured ? "fill-amber-500 text-amber-500" : "text-slate-400",
              )}
            />
            <span>{isFeatured ? "Unfeature Item" : "Feature Product"}</span>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/productsSet/${id}`}
              className="flex gap-3 items-center w-full px-3 py-2.5 rounded-xl cursor-pointer text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
            >
              <Edit size={16} />
              <span>Edit Product</span>
            </Link>
          </DropdownMenuItem>

          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

          <DropdownMenuItem
            disabled={isPending}
            onClick={() => setShowDeleteConfirm(true)}
            className="flex gap-3 items-center w-full px-3 py-2.5 rounded-xl cursor-pointer text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
          >
            <Trash2 size={16} />
            <span>Remove Item</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle
                  className="text-red-600 dark:text-red-400"
                  size={28}
                />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Delete Product?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
                Are you sure? This item will be removed from your store
                inventory immediately.
              </p>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                disabled={isPending}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 rounded-2xl text-xs font-black uppercase text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isPending}
                onClick={handleDelete}
                className="flex-1 px-4 py-3 rounded-2xl text-xs font-black uppercase bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Confirm"
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
