import "server-only";
import {
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  startAt,
  endAt,
  limit,
  QueryConstraint,
} from "firebase/firestore";

import { productsRef } from "@/lib/firebase";
import { ProductFilterKey, ProductType } from "@/types/productsTypes";
import { unstable_cache } from "next/cache";
function mapProduct(id: string, data: any): ProductType {
  return {
    id,
    p_name: data.p_name ?? "",
    p_cat: data.p_cat ?? "",
    p_cost: data.p_cost ?? 0,
    p_details: data.p_details ?? "",
    p_imgs: data.p_imgs ?? [],
    createdAt: data.createdAt?.toMillis?.() ?? null,
    isFeatured: data.isFeatured ?? false,
  };
}

export async function getProduct(id: string): Promise<ProductType | null> {
  try {
    const snap = await getDoc(doc(productsRef, id));
    return snap.exists() ? mapProduct(snap.id, snap.data()) : null;
  } catch (err) {
    console.error("getProduct error:", err);
    return null;
  }
}

export const getProducts = async (
  filterKey: ProductFilterKey = "all",
  filterValue = "",
  pageSize = 100,
): Promise<ProductType[]> => {
  // We define the data fetching logic inside unstable_cache
  const cachedFetch = unstable_cache(
    async (key: string, value: string, size: number) => {
      const constraints: QueryConstraint[] = [];

      if (key === "p_name" && value) {
        constraints.push(orderBy("p_name"));
        constraints.push(startAt(value));
        constraints.push(endAt(value + "\uf8ff"));
      }

      if (key === "p_cat" && value) {
        constraints.push(where("p_cat", "==", value));
      }

      constraints.push(limit(size));

      try {
        // This will now only log when the cache is EMPTY or EXPIRED
        console.log(`📡 FIREBASE DATABASE HIT: ${key} = ${value}`);

        const snap = await getDocs(query(productsRef, ...constraints));
        return snap.docs.map((d) => mapProduct(d.id, d.data()));
      } catch (err) {
        console.error("getProducts error:", err);
        return [];
      }
    },
    // Cache Key: Unique string based on arguments
    [`products-cache`],

    {
      revalidate: 30, // Optional: Auto-refresh every 1 hour
      tags: ["products-list"], // IMPORTANT: The tag we use to clear the cache
    },
  );

  return cachedFetch(filterKey, filterValue, pageSize);
};
