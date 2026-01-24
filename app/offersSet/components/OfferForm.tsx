"use client";

import { useState, useEffect, useRef } from "react";
import { ProductType } from "@/types/productsTypes";
import { Offer } from "@/types/offerTypes";
import {
  Package,
  Search,
  X,
  Check,
  Camera,
  ImagePlus,
  Loader,
  Save,
  Sparkles,
  Filter,
  ShieldCheck,
  ArrowRight,
  XCircle,
  Trash2,
  Calculator,
  PlusCircle,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { upload } from "@vercel/blob/client";
import { addOffer, upOffer } from "@/services/offersServices";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/data/categories";
import { getCategoryLabel } from "@/data/categoryMapping";

interface OfferFormProps {
  initialData?: Offer;
  availableProducts: ProductType[];
  pageTitle: string;
}

export default function OfferForm({
  initialData,
  availableProducts,
  pageTitle,
}: OfferFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<ProductType[]>(
    initialData?.products || [],
  );

  // Track quantities for each product
  const [productQuantities, setProductQuantities] = useState<
    Record<string, number>
  >(() => {
    const quantities: Record<string, number> = {};
    initialData?.products?.forEach((p) => {
      quantities[p.id] = p.p_qu || 1;
    });
    return quantities;
  });

  const [price, setPrice] = useState<number>(initialData?.price || 0);

  const [offerImage, setOfferImage] = useState<{
    url: string;
    file?: File;
  } | null>(initialData?.image ? { url: initialData.image } : null);

  // Calculate total cost of selected products with quantities
  const totalCost = selectedProducts.reduce(
    (sum, p) => sum + Number(p.p_cost || 0) * (productQuantities[p.id] || 1),
    0,
  );

  const savings = totalCost - price;

  // Auto-calculate price only when adding products if it matches the total (fresh state)
  // or we could optionaly keep it. The user requirement is to "adjust" it.
  // Existing behavior: resets price to total cost on change.
  // We will keep this behavior for now as it ensures the price reflects the content,
  // but now the user can easily re-apply savings using the new field.
  const calculateTotal = (
    products: ProductType[],
    quantities: Record<string, number>,
  ) => {
    return products.reduce(
      (sum, p) => sum + Number(p.p_cost || 0) * (quantities[p.id] || 1),
      0,
    );
  };

  const filteredProducts = availableProducts.filter((p) => {
    const nameMatch = p.p_name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = p.p_cat
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const filterCatMatch =
      selectedCategory === "all" || p.p_cat === selectedCategory;
    return (nameMatch || categoryMatch) && filterCatMatch;
  });

  const toggleProduct = (product: ProductType) => {
    let newProducts = [...selectedProducts];
    let newQuantities = { ...productQuantities };

    const isSelected = newProducts.some((p) => p.id === product.id);

    if (isSelected) {
      // Remove product
      newProducts = newProducts.filter((p) => p.id !== product.id);
      delete newQuantities[product.id];
    } else {
      // Add product
      newProducts.push(product);
      newQuantities[product.id] = 1;
    }

    setSelectedProducts(newProducts);
    setProductQuantities(newQuantities);
    setPrice(calculateTotal(newProducts, newQuantities));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    const newQuantities = { ...productQuantities, [productId]: quantity };
    setProductQuantities(newQuantities);
    setPrice(calculateTotal(selectedProducts, newQuantities));
  };

  const removeProduct = (productId: string) => {
    const newProducts = selectedProducts.filter((p) => p.id !== productId);
    const newQuantities = { ...productQuantities };
    delete newQuantities[productId];

    setSelectedProducts(newProducts);
    setProductQuantities(newQuantities);
    setPrice(calculateTotal(newProducts, newQuantities));
  };

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    setPending(true);
    try {
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };
      const compressed = await imageCompression(file, options);
      setOfferImage({
        url: URL.createObjectURL(compressed),
        file: compressed as File,
      });
    } catch (error) {
      toast.error("فشل معالجة الصورة");
    } finally {
      setPending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!offerImage) return toast.error("صورة العرض مطلوبة");
    if (selectedProducts.length === 0)
      return toast.error("يجب اختيار منتج واحد على الأقل");

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const badge = formData.get("badge") as string;

    setPending(true);
    const toastId = toast.loading("جاري حفظ العرض...");

    try {
      let imageUrl = offerImage.url;

      if (offerImage.file) {
        const blob = await upload(offerImage.file.name, offerImage.file, {
          access: "public",
          handleUploadUrl: "/api/uploadImgs",
        });
        imageUrl = blob.url;
      }

      const offerData = {
        title,
        description,
        price,
        badge,
        image: imageUrl,
        products: selectedProducts.map((p) => ({
          ...p,
          p_qu: productQuantities[p.id] || 1,
        })),
      };

      if (initialData?.id) {
        await upOffer(initialData.id, offerData);
        toast.success("تم تحديث العرض بنجاح", { id: toastId });
      } else {
        await addOffer(offerData);
        toast.success("تم إضافة العرض بنجاح", { id: toastId });
      }

      router.push("/offersSet");
      router.refresh();
    } catch (error: any) {
      if (error.message?.includes("NEXT_REDIRECT")) return;
      toast.error(error.message || "فشل الحفظ", { id: toastId });
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen bg-background relative"
    >
      {/* Optimized Header */}
      <header className="sticky top-0 z-50 bg-card  border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/offersSet"
              className="p-1.5 hover:bg-muted rounded-full transition-colors hidden md:flex"
            >
              <ArrowRight size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-tiny font-black text-primary uppercase tracking-[0.2em]">
                <ShieldCheck size={10} />
                بوابة الإدارة
              </div>
              <h1 className="text-sm font-black text-foreground uppercase tracking-tight leading-none mt-0.5">
                {pageTitle.split(" ")[0]}{" "}
                <span className="text-primary">
                  {pageTitle.split(" ").slice(1).join(" ")}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/offersSet")}
              className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-small font-black uppercase tracking-widest hover:bg-muted/80 active:scale-95 transition-all outline-none"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-small font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all outline-none"
            >
              {pending ? (
                <Loader className="animate-spin" size={12} />
              ) : (
                <Save size={12} />
              )}
              <span>{initialData ? "حفظ التعديلات" : "نشر العرض"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <h2 className="text-tiny font-black uppercase tracking-widest text-foreground">
                المعلومات الأساسية
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Side: Image */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted border border-dashed border-border group transition-all hover:border-primary/50 shadow-inner">
                {offerImage ? (
                  <>
                    <Image
                      src={offerImage.url}
                      alt="Offer preview"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label
                        htmlFor="offerImg"
                        className="p-2 bg-white/10 backdrop-blur-md rounded-full cursor-pointer text-white hover:scale-110 transition-transform"
                      >
                        <Camera size={20} />
                      </label>
                    </div>
                  </>
                ) : (
                  <label
                    htmlFor="offerImg"
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                  >
                    <ImagePlus
                      size={32}
                      className="text-muted-foreground mb-1"
                    />
                    <span className="text-small font-black uppercase text-muted-foreground tracking-tighter">
                      صورة العرض المميزة
                    </span>
                  </label>
                )}
                <input
                  id="offerImg"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={pending}
                />
              </div>

              {/* Right Side: Fields */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-small font-black uppercase text-muted-foreground tracking-wider mb-1 block">
                    عنوان العرض
                  </label>
                  <input
                    name="title"
                    defaultValue={initialData?.title}
                    required
                    placeholder="مثال: كومبو التوفير العائلي"
                    className="w-full px-3 py-2.5 bg-muted/20 border border-border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-small font-black uppercase text-muted-foreground tracking-wider mb-1 block">
                    شارة العرض
                  </label>
                  <input
                    name="badge"
                    defaultValue={initialData?.badge}
                    placeholder="مثال: محدود، جديد"
                    className="w-full px-3 py-2.5 bg-muted/20 border border-border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Price & Savings Calculation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-4 mt-4">
              <div className="relative">
                <label className="text-small font-black uppercase text-muted-foreground tracking-wider mb-1 block">
                  القيمة الإجمالية
                  <span className="text-primary/60 mr-1">(الأصلية)</span>
                </label>
                <div className="w-full px-3 py-2.5 bg-muted/10 border border-border rounded-xl text-sm font-black text-muted-foreground cursor-not-allowed shadow-inner flex items-center justify-between">
                  <span>{totalCost.toLocaleString()}</span>
                  <span className="text-[10px] text-muted-foreground/60">
                    ج.س
                  </span>
                </div>
              </div>

              <div className="relative">
                <label className="text-small font-black uppercase text-muted-foreground tracking-wider mb-1 block">
                  قيمة التوفير
                  <span className="text-green-600 mr-1 text-[10px]">(خصم)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={savings}
                    onChange={(e) => {
                      const newSavings = Number(e.target.value);
                      setPrice(totalCost - newSavings);
                    }}
                    className="w-full px-3 py-2.5 bg-green-500/5 border border-green-500/20 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-green-500/20 pr-8 shadow-inner text-green-700"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 font-bold text-xs">
                    -
                  </span>
                </div>
              </div>

              <div className="relative">
                <label className="text-small font-black uppercase text-muted-foreground tracking-wider mb-1 block">
                  سعر العرض
                  <span className="text-primary/60 mr-1">(النهائي)</span>
                </label>
                <div className="relative">
                  <input
                    name="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2.5 bg-muted/20 border border-border rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 pr-8 shadow-inner"
                  />
                  <Calculator
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-small font-black uppercase text-muted-foreground tracking-wider mb-1 block">
                وصف محتويات العرض والمزايا
              </label>
              <textarea
                name="description"
                defaultValue={initialData?.description}
                required
                rows={2}
                placeholder="اشرح مكونات العرض والمزايا للعملاء..."
                className="w-full px-3 py-2.5 bg-muted/20 border border-border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Selected Products Area */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-primary" />
                <h3 className="text-tiny font-black uppercase tracking-widest text-foreground">
                  مكونات العرض
                </h3>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-small font-black rounded-full border border-primary/10">
                  {selectedProducts.length} عناصر
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-small font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                <PlusCircle size={14} />
                إضافة منتجات
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedProducts.length === 0 ? (
                <div className="col-span-full text-center py-10 border-2 border-dashed border-border rounded-2xl bg-muted/5 opacity-50 flex flex-col items-center gap-2">
                  <Package size={24} className="text-muted-foreground" />
                  <p className="text-tiny font-black uppercase tracking-widest">
                    لم يتم اختيار منتجات بعد
                  </p>
                </div>
              ) : (
                selectedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-xl group hover:border-primary/40 transition-all animate-in zoom-in-95 duration-200"
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden border border-border bg-white">
                      <Image
                        src={p.p_imgs[0]?.url || "/placeholder.png"}
                        alt={p.p_name}
                        fill
                        sizes="48px"
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-small font-black text-foreground truncate">
                        {p.p_name}
                      </h4>
                      <p className="text-small text-primary font-bold">
                        {Number(p.p_cost).toLocaleString()} ج.س
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-muted rounded-lg border border-border p-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            p.id,
                            (productQuantities[p.id] || 1) - 1,
                          )
                        }
                        className="p-1 hover:bg-background rounded transition-colors"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                      <span className="text-small font-black min-w-[20px] text-center">
                        {productQuantities[p.id] || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            p.id,
                            (productQuantities[p.id] || 1) + 1,
                          )
                        }
                        className="p-1 hover:bg-background rounded transition-colors"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeProduct(p.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all active:scale-90"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Product Picker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Content */}
          <div className="relative w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl flex flex-col h-[85vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            {/* Modal Header */}
            <div className="p-4 border-b border-border bg-muted/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Package size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-base font-black text-foreground uppercase tracking-tight">
                    اختيار المنتجات
                  </h2>
                  <p className="text-small font-black text-muted-foreground uppercase tracking-widest mt-0.5">
                    تصفح كتالوج المنتجات لإضافتها للعرض
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Filters - Single Line */}
            <div className="p-3 bg-card flex items-center gap-2 border-b border-border">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث بالاسم أو التصنيف..."
                  className="w-full pr-9 pl-4 py-2 bg-muted/20 border border-border rounded-xl text-small font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner h-9"
                />
              </div>

              <div className="w-36">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="h-9 bg-muted/20 border-border text-small font-black rounded-xl px-3 shadow-inner">
                    <div className="flex items-center gap-2">
                      <Filter size={12} className="text-primary" />
                      <SelectValue placeholder="التصنيف" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border rounded-xl">
                    <SelectItem value="all" className="text-small font-bold">
                      جميع الأصناف
                    </SelectItem>
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className="text-small font-bold"
                      >
                        {getCategoryLabel(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Modal List View */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar bg-muted/5">
              <div className="flex flex-col gap-2">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const isSelected = selectedProducts.some(
                      (p) => p.id === product.id,
                    );
                    return (
                      <div
                        key={product.id}
                        onClick={() => toggleProduct(product)}
                        className={`group flex items-center gap-3 p-2 bg-card rounded-xl border transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? "border-primary ring-1 ring-primary/20 bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/40 hover:bg-muted/10 animate-in fade-in"
                        }`}
                      >
                        {/* Name & Category Info */}
                        <div className="flex-1 min-w-0 text-right">
                          <h4
                            className={`text-small font-black truncate leading-none ${isSelected ? "text-primary" : "text-foreground"}`}
                          >
                            {product.p_name}
                          </h4>
                          <span className="text-tiny mt-2 font-black text-muted-foreground uppercase tracking-widest bg-muted/80 px-1.5 py-0.5 rounded-md mt-3 inline-block">
                            {getCategoryLabel(product.p_cat)}
                          </span>
                        </div>

                        {/* Middle: Price */}
                        <div className="px-4 border-r border-border/40 text-left">
                          <p className="text-small font-black text-foreground whitespace-nowrap">
                            {Number(product.p_cost).toLocaleString()}{" "}
                            <span className="text-tiny text-primary">ج.س</span>
                          </p>
                        </div>

                        {/* Right: Selection Icon */}
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-all ${
                            isSelected
                              ? "bg-primary border-primary text-white scale-105 shadow-md shadow-primary/20"
                              : "bg-muted border-border text-muted-foreground group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:text-primary"
                          }`}
                        >
                          {isSelected ? (
                            <Check size={16} strokeWidth={4} />
                          ) : (
                            <PlusCircle size={16} />
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                    <XCircle size={48} className="mb-3" />
                    <p className="text-base font-black uppercase tracking-widest text-muted-foreground">
                      لا توجد نتائج مطابقة
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/5 flex items-center justify-between">
              <p className="text-tiny font-black text-muted-foreground uppercase tracking-widest">
                تم اختيار{" "}
                <span className="text-primary">{selectedProducts.length}</span>{" "}
                منتجات
              </p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-2.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
              >
                تم الحفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
