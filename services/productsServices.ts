"use server";

import { addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

import { productsRef } from "@/lib/firebase";
import { revalidatePath } from "next/cache";
import { ProductType } from "@/types/productsTypes";

export async function addProduct(
  data: Omit<ProductType, "id">,
): Promise<string> {
  // console.log("add product to servers", data);

  const res = await addDoc(productsRef, data);
  // revalidateTag("products-list", "products-cache");
  revalidatePath("/productsSet");
  return res.id;
}

export async function upProduct(
  id: string,
  data: Partial<ProductType>,
): Promise<void> {
  await updateDoc(doc(productsRef, id), data as any);
  revalidatePath("/productsSet");
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
    revalidatePath("/productsSet");

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
    revalidatePath("/productsSet");
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product.");
  }
}
