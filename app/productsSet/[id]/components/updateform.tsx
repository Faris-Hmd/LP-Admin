"use client";
import Link from "next/link";
import { categories } from "@/data/categories";
import { getCategoryLabel } from "@/data/categoryMapping";
import { Camera, Edit2, ImagePlus, Loader } from "lucide-react";
import { useState } from "react";
import ProductImgCarousel from "@/components/carousel";
import { upload } from "@vercel/blob/client";
import { product_update } from "../actions/product_update";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductImage, ProductType } from "@/types/productsTypes";
import imageCompression from "browser-image-compression";
import { redirect } from "next/navigation";

export default function UpdateForm({ product }: { product: ProductType }) {
  const [imgs, setImgs] = useState<ProductImage[]>(product.p_imgs || []);
  const [pending, setPending] = useState(false);

  async function handleImgChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setPending(true); // Show loader while compressing

    const options = {
      maxSizeMB: 0.8, // Max size ~800KB
      maxWidthOrHeight: 1280, // High res but optimized
      useWebWorker: true,
    };

    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          const compressed = await imageCompression(file, options);
          return {
            url: URL.createObjectURL(compressed),
            productImgFile: compressed, // Now sending optimized blob
          };
        }),
      );

      setImgs((prev) => [...prev, ...compressedFiles]);
    } catch (error) {
      toast.error("فشل ضغط الصور");
    } finally {
      setPending(false);
    }
  }

  function handleRemove(imgUrl: string) {
    if (imgUrl.startsWith("blob:")) URL.revokeObjectURL(imgUrl);
    setImgs((prev) => prev.filter((img) => img.url !== imgUrl));
  }

  async function handleProductImgsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // 1. CAPTURE DATA IMMEDIATELY
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    if (imgs.length === 0) return toast.error("الصور مطلوبة");

    setPending(true);
    const toastId = toast.loading("جاري المزامنة...");

    try {
      // 2. Filter existing vs new images
      const existingUrls = imgs
        .filter((img) => !img.url.startsWith("blob:"))
        .map((img) => ({ url: img.url }));

      const newFiles = imgs.filter((img) => img.url.startsWith("blob:"));

      // 3. Parallel Upload
      const uploadTasks = newFiles.map((img) =>
        upload(img.productImgFile!.name, img.productImgFile!, {
          access: "public",
          handleUploadUrl: "/api/uploadImgs",
        }),
      );

      const uploadedBlobs = await Promise.all(uploadTasks);
      const newUrls = uploadedBlobs.map((blob) => ({ url: blob.url }));

      // 4. Update Captured FormData
      formData.set("p_imgs", JSON.stringify([...existingUrls, ...newUrls]));
      formData.set("id", product.id); // Ensure ID is passed from the prop

      // 5. Execute Action
      const result = await product_update(formData);

      toast.success("تم التحديث بنجاح", { id: toastId });
      setPending(false);
      redirect("/productsSet" as any);
    } catch (error: any) {
      // Ignore Next.js redirect internal errors
      if (error.message?.includes("NEXT_REDIRECT")) return;

      console.error("Submission error:", error);
      toast.error(error.message || "فشل التحديث", { id: toastId });
      setPending(false);
    }
  }

  return (
    <div className="p-2 lg:p-6 max-w-xl mx-auto">
      <form
        onSubmit={handleProductImgsSubmit}
        className="relative bg-card p-6 rounded-xl border border-border shadow-sm overflow-hidden"
      >
        {/* Loading Overlay */}
        {pending && (
          <div className="z-50 absolute inset-0 bg-background/60 md:backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader className="animate-spin text-primary" size={28} />
          </div>
        )}

        {/* Media Section */}
        <div className="mb-6">
          {imgs.length > 0 ? (
            <ProductImgCarousel
              imgH="h-56 rounded-lg shadow-inner"
              imgFill="object-cover"
              handleRemove={handleRemove}
              imgs={imgs}
            />
          ) : (
            <div className="h-56 w-full bg-muted/50 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border">
              <ImagePlus size={36} className="text-muted-foreground mb-2" />
              <p className="text-xs font-black uppercase text-muted-foreground tracking-tighter">
                الوسائط مطلوبة
              </p>
            </div>
          )}

          <div className="flex justify-end -mt-12 mr-3 relative z-10">
            <label
              className="p-2.5 bg-primary text-primary-foreground rounded-lg cursor-pointer shadow-lg active:scale-95 transition-transform"
              htmlFor="imgsInput"
            >
              <Camera size={20} />
            </label>
            <input
              className="hidden"
              id="imgsInput"
              multiple
              type="file"
              accept="image/*"
              onChange={handleImgChange}
              disabled={pending}
            />
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-5">
          <div>
            <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider ml-1 mb-1.5 block">
              اسم المنتج
            </label>
            <input
              name="p_name"
              defaultValue={product.p_name}
              type="text"
              required
              placeholder="أدخل اسم العنصر..."
              disabled={pending}
              className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider ml-1 mb-1.5 block">
              مواصفات المنتج
            </label>
            <textarea
              name="p_details"
              defaultValue={product.p_details}
              required
              rows={3}
              placeholder="أدرج الميزات الأساسية..."
              disabled={pending}
              className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none resize-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider ml-1 mb-1.5 block">
                السعر (ج.س)
              </label>
              <input
                name="p_cost"
                defaultValue={product.p_cost}
                type="number"
                required
                placeholder="0"
                disabled={pending}
                className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm font-bold text-foreground outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider ml-1 mb-1.5 block">
                تصنيف المنتج
              </label>
              <Select
                name="p_cat"
                defaultValue={product.p_cat}
                disabled={pending}
              >
                <SelectTrigger className="h-[44px] bg-muted/50 border-border text-xs font-black uppercase rounded-lg">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="text-xs font-bold uppercase py-2"
                    >
                      {getCategoryLabel(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8 pt-5 border-t border-border">
          <Link
            href={"/productsSet" as any}
            className="flex-1 py-3 rounded-lg bg-muted text-muted-foreground text-xs font-black uppercase text-center active:scale-95 transition-transform"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="flex-[1.5] flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground text-xs font-black uppercase shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          >
            {pending ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Edit2 size={16} />
            )}
            تحديث المنتج
          </button>
        </div>
      </form>
    </div>
  );
}
