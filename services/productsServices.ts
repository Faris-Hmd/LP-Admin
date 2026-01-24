"use server";

import {
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
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
import { revalidatePath, unstable_cache } from "next/cache";
import { ProductFilterKey, ProductType } from "@/types/productsTypes";

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
        console.log(`📡 FIREBASE DATABASE HIT: ${key} = ${value}`);
        const snap = await getDocs(query(productsRef, ...constraints));
        return snap.docs.map((d) => mapProduct(d.id, d.data()));
      } catch (err) {
        console.error("getProducts error:", err);
        return [];
      }
    },
    [`products-cache`],
    {
      revalidate: 30,
      tags: ["products-list"],
    },
  );

  return cachedFetch(filterKey, filterValue, pageSize);
};

export async function addProduct(
  data: Omit<ProductType, "id">,
): Promise<string> {
  // console.log("add product to servers", data);

  const res = await addDoc(productsRef, data);
  revalidatePath("/productsSet", "page");
  return res.id;
}

export async function upProduct(
  id: string,
  data: Partial<ProductType>,
): Promise<void> {
  await updateDoc(doc(productsRef, id), data as any);
  revalidatePath("/productsSet", "page");
}

export async function product_feature_toggle(
  id: string,
  currentStatus: boolean,
) {
  try {
    const docRef = doc(productsRef, id);
    await updateDoc(docRef, {
      isFeatured: !currentStatus,
    });
    revalidatePath("/productsSet", "page");

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function product_dlt(id: string): Promise<void> {
  try {
    const docRef = doc(productsRef, id);
    await deleteDoc(docRef);
    revalidatePath("/productsSet", "page");
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product.");
  }
}
