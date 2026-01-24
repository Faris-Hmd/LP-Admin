"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deleteOffer } from "@/services/offersServices";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeleteOfferBtn({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteOffer(id);
        toast.success("تم حذف العرض بنجاح");
        setOpen(false);
      } catch (error) {
        toast.error("فشل حذف العرض");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-1.5 bg-muted hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors border border-transparent hover:border-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed"
          title="حذف العرض"
        >
          <Trash2 size={14} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] ">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </div>
          <DialogDescription className="text-right">
            هل أنت متأكد من أنك تريد حذف هذا العرض؟ لا يمكن التراجع عن هذا
            الإجراء وسيتم إزالته من القائمة نهائياً.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              إلغاء
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="gap-2"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            تأكيد الحذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
