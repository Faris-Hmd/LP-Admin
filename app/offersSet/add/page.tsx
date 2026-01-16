import { getProducts } from "@/data/productsData";
import OfferForm from "../components/OfferForm";

export default async function AddOfferPage() {
  const products = await getProducts("all", "", 100);

  return (
    <div className="min-h-screen bg-background">
      <OfferForm availableProducts={products} pageTitle="إنشاء عرض جديد" />
    </div>
  );
}
