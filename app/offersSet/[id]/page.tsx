import { getProducts } from "@/data/productsData";
import { getOffer } from "@/services/offersServices";
import OfferForm from "../components/OfferForm";
import { notFound } from "next/navigation";

export default async function EditOfferPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const [offer, products] = await Promise.all([
    getOffer(id),
    getProducts("all", "", 100),
  ]);

  if (!offer) notFound();

  return (
    <div className="min-h-screen bg-background">
      <OfferForm
        initialData={offer}
        availableProducts={products}
        pageTitle="تعديل العرض الحالي"
      />
    </div>
  );
}
