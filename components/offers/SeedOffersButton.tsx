"use client";

import { useState } from "react";
import { seedOffersFromProducts } from "@/services/seedOffers";
import { Loader2, Database } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SeedOffersButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      const res = await seedOffersFromProducts();
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to seed data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSeed}
      disabled={isLoading}
      className="flex items-center gap-2 bg-secondary/80 hover:bg-secondary text-secondary-foreground font-bold py-2 px-3 rounded text-[10px] uppercase tracking-widest transition-all"
    >
      {isLoading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Database size={14} />
      )}
      <span className="hidden sm:inline">توليد بيانات</span>
    </button>
  );
}
