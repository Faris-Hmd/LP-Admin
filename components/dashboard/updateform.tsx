"use client";
import Link from "next/link";
import { categories } from "@/data/categories";
import { Camera, CircleX, Edit2, ImagePlus, Loader } from "lucide-react";
import { useState } from "react";
import ProductImgCarousel from "@/components/carousel";
import { upload } from "@vercel/blob/client";
import { product_update } from "../../app/productsSet/[id]/actions/product_update";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductImage, ProductType } from "@/types/productsTypes";

export default function UpdateForm({ product }: { product: ProductType }) {
  const [imgs, setImgs] = useState<ProductImage[]>(product.p_imgs || []);
  const [pending, setPending] = useState(false);

  function handleImgChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newImgs = files.map((file) => ({
      url: URL.createObjectURL(file),
      productImgFile: file,
    }));
    setImgs((prev) => [...prev, ...newImgs]);
  }

  function handleRemove(imgUrl: string) {
    console.log("remove");
    // If it's a local blob, revoke it to free memory
    if (imgUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imgUrl);
    }
    setImgs((prev) => prev.filter((img) => img.url !== imgUrl));
  }

  async function handleProductImgsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (imgs.length === 0)
      return toast.error("يجب أن يحتوي المنتج على صورة واحدة على الأقل");

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    // Start loading state
    setPending(true);
    const toastId = toast.loading("جاري تحديث المنتج والصور...");

    try {
      // 1. Filter existing vs new images
      const existingUrls = imgs
        .filter((img) => !img.url.startsWith("blob:"))
        .map((img) => ({ url: img.url }));

      const newFiles = imgs.filter((img) => img.url.startsWith("blob:"));

      // 2. Parallel Upload (faster in 2025)
      const uploadTasks = newFiles.map((img) =>
        upload(img.productImgFile.name, img.productImgFile, {
          access: "public",
          handleUploadUrl: "/api/uploadImgs",
        }),
      );

      const uploadedBlobs = await Promise.all(uploadTasks);
      const newUrls = uploadedBlobs.map((blob) => ({ url: blob.url }));

      // 3. Prepare Final Data
      const finalImgs = [...existingUrls, ...newUrls];
      formData.set("p_imgs", JSON.stringify(finalImgs));
      formData.set("id", product.id);

      // 4. Server Action
      await product_update(formData);

      // 5. Success
      toast.success("تم تحديث المنتج بنجاح!", { id: toastId });
      setPending(false);
    } catch (error: any) {
      // Critical Fix: Ignore Next.js redirect "errors"
      if (error.message === "NEXT_REDIRECT") {
        toast.success("جاري إعادة التوجيه...", { id: toastId });
        return;
      }

      console.error("Update Error:", error);
      toast.error(error.message || "فشل تحديث المنتج", { id: toastId });
      setPending(false);
    }
  }
  return (
    // Use a light gray background for contrast
    <div className="bg-transparent lg:min-h-screen p-2">
      {/* Header Card (White background, black text/border) */}

      {/* Main Form Container (White background, subtle shadow) */}
      <form
        onSubmit={handleProductImgsSubmit}
        className="relative bg-card p-6 md:p-8 rounded-xl shadow-lg border border-border max-w-2xl mx-auto transition-colors"
      >
        {/* Loading Overlay */}
        {pending && (
          <div className="z-50 cursor-wait w-full h-full backdrop-blur-[2px] absolute top-0 left-0 bg-background/60 flex flex-col items-center justify-center rounded-xl transition-all">
            <Loader className="animate-spin h-10 w-10 text-primary" />
            <p className="text-primary font-black mt-4 uppercase tracking-widest text-xs">
              جاري حفظ التغييرات...
            </p>
          </div>
        )}

        {/* Image Display Section */}
        <div className="mb-8">
          <div>
            {imgs.length > 0 ? (
              <ProductImgCarousel
                imgH={"h-64 rounded-xl shadow-inner"}
                imgFill={"object-cover"}
                handleRemove={handleRemove}
                imgs={imgs}
              />
            ) : (
              <div className="h-64 w-full bg-muted/50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border transition-colors">
                <div className="p-4 bg-card rounded-full shadow-md mb-3 border border-border">
                  <ImagePlus size={40} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-bold">
                  لا توجد صور للمنتج
                </p>
                <p className="text-muted-foreground/70 text-[10px] font-bold uppercase tracking-widest mt-1">
                  أضف صور JPEG أو PNG
                </p>
              </div>
            )}

            {/* Blue Action Upload Button */}
            <div className="flex justify-end mt-4">
              <label
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer shadow-sm
                  ${
                    pending
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                  }
                `}
                htmlFor="imgsInput"
              >
                <Camera size={18} />
                {pending ? "جاري الرفع..." : "اختر صور"}
              </label>
              <input
                className="hidden"
                id="imgsInput"
                multiple
                name="file"
                type="file"
                accept="image/*"
                onChange={handleImgChange}
                disabled={pending}
              />
            </div>
          </div>
        </div>

        {/* Form Fields - Black/Slate text and borders */}
        <div className="space-y-5">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-1.5">
              اسم المنتج
            </label>
            <input
              name="p_name"
              type="text"
              required
              defaultValue={product.p_name}
              disabled={pending}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground"
              placeholder="مثال: لوحة مفاتيح ميكانيكية"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-1.5">
              التفاصيل
            </label>
            <textarea
              name="p_details"
              required
              rows={3}
              defaultValue={product.p_details}
              disabled={pending}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground resize-none"
              placeholder="المواصفات والمميزات الكاملة..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-1.5">
                التكلفة (SDG)
              </label>
              <input
                name="p_cost"
                type="number"
                required
                defaultValue={product.p_cost}
                disabled={pending}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-1.5">
                التصنيف
              </label>
              <Select
                name="p_cat"
                defaultValue={product.p_cat}
                disabled={pending}
              >
                <SelectTrigger className="w-full h-[42px] bg-background border border-border text-sm font-semibold text-foreground rounded-lg focus:ring-2 focus:ring-primary">
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="text-foreground focus:bg-muted font-semibold text-xs uppercase tracking-wider"
                    >
                      {cat.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Action Buttons - Blue primary, gray secondary */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border">
          <Link
            href="/productsSet"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-muted/50 text-muted-foreground text-sm font-bold hover:bg-muted transition-colors"
          >
            <CircleX size={18} /> إلغاء
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-black shadow-lg shadow-primary/20 transition-all disabled:opacity-50 
            bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
          >
            {pending ? (
              <>
                <Loader size={18} className="animate-spin" /> جاري الحفظ...
              </>
            ) : (
              <>
                <Edit2 size={18} /> تحديث المنتج
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
