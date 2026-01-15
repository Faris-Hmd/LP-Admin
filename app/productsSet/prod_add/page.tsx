"use client";
import Link from "next/link";
import { categories } from "@/data/categories";
import {
  Camera,
  CircleX,
  ImagePlus,
  Loader,
  Upload,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import ProductImgCarousel from "@/components/carousel";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductImage } from "@/types/productsTypes";
import { addProduct } from "@/services/productsServices";
import imageCompression from "browser-image-compression";

export default function ProductImgUpload() {
  const [imgs, setImgs] = useState<ProductImage[]>([]);
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
    setImgs((prev) => prev.filter((img) => img.url !== imgUrl));
    URL.revokeObjectURL(imgUrl);
  }

  async function handleProductImgsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (imgs.length === 0) return toast.error("Please add images!");

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    const uploadAndSubmit = async (): Promise<string> => {
      setPending(true);
      try {
        const uploadTasks = imgs.map((img) =>
          upload(img.productImgFile!.name, img.productImgFile!, {
            access: "public",
            handleUploadUrl: "/api/uploadImgs",
          }),
        );

        const blobs = await Promise.all(uploadTasks);
        const productImgsUrl = blobs.map((blob) => ({ url: blob.url }));

        await addProduct({
          p_name: formData.get("p_name") as string,
          p_cat: formData.get("p_cat") as string,
          p_cost: Number(formData.get("p_cost")),
          p_details: formData.get("p_details") as string,
          p_imgs: productImgsUrl,
        });

        imgs.forEach((img) => URL.revokeObjectURL(img.url));
        setImgs([]);
        formElement.reset();
        return "Product added successfully!";
      } catch (error) {
        throw new Error("Failed to upload images or save product.");
      } finally {
        setPending(false);
      }
    };

    toast.promise(uploadAndSubmit(), {
      loading: "Syncing with database...",
      success: (data: string) => data,
      error: (err: Error) => err.message,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-20">
      {/* Sticky Header - Matches Update & Table style */}
      <header className="sticky top-0 z-100 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-0.5">
                <ShieldCheck size={10} />
                Creator Mode
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Add <span className="text-blue-600">New Product</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4">
        <form
          onSubmit={handleProductImgsSubmit}
          className="relative bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden max-w-xl mx-auto"
        >
          {/* Loading Overlay */}
          {pending && (
            <div className="z-50 absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader className="animate-spin text-blue-600" size={28} />
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
              <div className="h-56 w-full bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800">
                <ImagePlus size={36} className="text-slate-300 mb-2" />
                <p className="text-xs font-black uppercase text-slate-400 tracking-tighter">
                  Media Required
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

          {/* Input Fields */}
          <div className="space-y-5">
            <div>
              <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1 mb-1.5 block">
                Product Title
              </label>
              <input
                name="p_name"
                type="text"
                required
                placeholder="Enter item name..."
                disabled={pending}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1 mb-1.5 block">
                Product Specifications
              </label>
              <textarea
                name="p_details"
                required
                rows={3}
                placeholder="List key features..."
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
                  placeholder="0"
                  disabled={pending}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-slate-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1 mb-1.5 block">
                  Category Tag
                </label>
                <Select name="p_cat" disabled={pending}>
                  <SelectTrigger className="h-[44px] bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-xs font-black uppercase rounded-lg">
                    <SelectValue placeholder="Select" />
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

          {/* Action Buttons */}
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
                <Upload size={16} />
              )}
              Publish Product
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
