"use client";
import Link from "next/link";
import { categories } from "@/data/categories";
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
      toast.error("Image compression failed");
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

    if (imgs.length === 0) return toast.error("Image required");

    setPending(true);
    const toastId = toast.loading("Syncing...");

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

      toast.success("Updated successfully", { id: toastId });
      setPending(false);
      redirect("/productsSet" as any);
    } catch (error: any) {
      // Ignore Next.js redirect internal errors
      if (error.message?.includes("NEXT_REDIRECT")) return;

      console.error("Submission error:", error);
      toast.error(error.message || "Update failed", { id: toastId });
      setPending(false);
    }
  }

  return (
    <div className="p-2 lg:p-6 max-w-xl mx-auto">
      <form
        onSubmit={handleProductImgsSubmit}
        className="relative bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        {pending && (
          <div className="z-50 absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader className="animate-spin text-blue-600" size={28} />
          </div>
        )}

        {/* Compact Carousel */}
        <div className="mb-6">
          {imgs.length > 0 ? (
            <ProductImgCarousel
              imgH="h-56 rounded-lg shadow-inner" // Slightly taller for better visibility
              imgFill="object-cover"
              handleRemove={handleRemove}
              imgs={imgs}
            />
          ) : (
            <div className="h-56 w-full bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800">
              <ImagePlus size={36} className="text-slate-300 mb-2" />
              <p className="text-xs font-black uppercase text-slate-400 tracking-tighter">
                No Media
              </p>
            </div>
          )}

          <div className="flex justify-end -mt-12 mr-3 relative z-10">
            <label
              className="p-2.5 bg-blue-600 text-white rounded-lg cursor-pointer shadow-lg active:scale-95 transition-transform"
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

        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1 mb-1.5 block">
              Product Title
            </label>
            <input
              name="p_name"
              type="text"
              required
              defaultValue={product.p_name}
              disabled={pending}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1 mb-1.5 block">
              Specifications
            </label>
            <textarea
              name="p_details"
              required
              rows={3}
              defaultValue={product.p_details}
              disabled={pending}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none resize-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1 mb-1.5 block">
                Price (SDG)
              </label>
              <input
                name="p_cost"
                type="number"
                required
                defaultValue={product.p_cost}
                disabled={pending}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-slate-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1 mb-1.5 block">
                Category Tag
              </label>
              <Select
                name="p_cat"
                defaultValue={product.p_cat}
                disabled={pending}
              >
                <SelectTrigger className="h-[44px] bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-xs font-black uppercase rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 border-slate-800">
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="text-xs font-bold uppercase py-2"
                    >
                      {cat.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
          <Link
            href={"/productsSet" as any}
            className="flex-1 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black uppercase text-center active:scale-95 transition-transform"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="flex-[1.5] flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 text-white text-xs font-black uppercase shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
          >
            {pending ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Edit2 size={16} />
            )}
            Update Product
          </button>
        </div>
      </form>
    </div>
  );
}
