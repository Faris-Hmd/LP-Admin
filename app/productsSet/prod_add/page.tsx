"use client";
import Link from "next/link";
import { categories } from "@/data/categories";
import { getCategoryLabel } from "@/data/categoryMapping";
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
      toast.error("فشل ضغط الصور");
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
    if (imgs.length === 0) return toast.error("يرجى إضافة صور!");

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
          createdAt: Date.now(),
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
      loading: "جاري المزامنة مع قاعدة البيانات...",
      success: (data: string) => data,
      error: (err: Error) => err.message,
    });
  }

  return (
    <div className="min-h-screen bg-background transition-colors pb-20">
      {/* Sticky Header - Matches Update & Table style */}
      <header className="sticky top-0 z-100 bg-card md:bg-card/80 md:backdrop-blur-md border-b border-border shadow-sm mb-6">
        <div className="max-w-4xl mx-auto p-3 md:p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
                <ShieldCheck size={10} />
                وضع المنشئ
              </div>
              <h1 className="text-xl font-black text-foreground uppercase tracking-tight">
                إضافة <span className="text-primary">منتج جديد</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4">
        <form
          onSubmit={handleProductImgsSubmit}
          className="relative bg-card p-6 rounded-xl border border-border shadow-sm overflow-hidden max-w-xl mx-auto"
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
                <Select name="p_cat" disabled={pending}>
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
                <Upload size={16} />
              )}
              نشر المنتج
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
