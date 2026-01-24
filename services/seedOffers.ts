"use server";

import { productsRef, offersRef } from "@/lib/firebase";
import { getDocs, addDoc } from "firebase/firestore";
import { ProductType } from "@/types/productsTypes";
import { Offer } from "@/types/offerTypes";
import { revalidatePath } from "next/cache";

export async function seedOffersFromProducts() {
  try {
    // 1. Fetch all existing products
    const productsSnap = await getDocs(productsRef);
    const allProducts = productsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ProductType[];

    if (allProducts.length === 0) {
      console.log("No products found to seed offers from.");
      return { success: false, message: "No products found" };
    }

    // 2. Define Offer Templates
    // We will create 3 example offers combining these products
    const offersToCreate = [
      {
        title: "عرض العائلة الكبير",
        description: "3 بيتزا من اختيارك مع مشروبات غازية مجانية",
        badge: "الأكثر مبيعاً",
        image:
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop",
        priceMultiplier: 0.85, // 15% discount
        productCount: 3,
      },
      {
        title: "عرض التوفير الثنائي",
        description: "2 بيتزا وسط بسعر خاص جداً",
        badge: "توفير",
        image:
          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop",
        priceMultiplier: 0.9, // 10% discount
        productCount: 2,
      },
      {
        title: "وجبة الغداء السريعة",
        description: "بيتزا واحدة مع سلطة ومشروب",
        badge: "جديد",
        image:
          "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=600&auto=format&fit=crop",
        priceMultiplier: 0.95, // 5% discount
        productCount: 1,
      },
    ];

    const createdOffers = [];

    // 3. Generate and Add Offers
    for (const template of offersToCreate) {
      // Select random products for this offer
      const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
      const selectedProducts = shuffled
        .slice(0, template.productCount)
        .map((p) => {
          let createdAt = p.createdAt;
          // transform timestamp to number
          if (
            createdAt &&
            typeof createdAt === "object" &&
            "toMillis" in createdAt
          ) {
            createdAt = (createdAt as any).toMillis();
          } else if (createdAt instanceof Date) {
            createdAt = createdAt.getTime();
          }

          return { ...p, createdAt: createdAt as number | undefined };
        });

      // Calculate total original price
      const originalPrice = selectedProducts.reduce(
        (sum, p) => sum + (Number(p.p_cost) || 0),
        0,
      );

      // Apply discount
      const offerPrice = Math.floor(originalPrice * template.priceMultiplier);

      const newOffer: Omit<Offer, "id"> = {
        title: template.title,
        description: `${template.description}`,
        image: template.image,
        badge: template.badge,
        products: selectedProducts,
        price: offerPrice,
        createdAt: Date.now(),
      };

      const res = await addDoc(offersRef, newOffer);
      createdOffers.push(res.id);
    }
    revalidatePath("/offersSet");
    return {
      success: true,
      message: `Successfully seeded ${createdOffers.length} offers`,
      ids: createdOffers,
    };
  } catch (error) {
    console.error("Error seeding offers:", error);
    return { success: false, message: "Error seeding offers" };
  }
}
