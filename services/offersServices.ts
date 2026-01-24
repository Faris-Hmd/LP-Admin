"use server";

import {
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { offersRef } from "@/lib/firebase";
import { revalidatePath, unstable_cache } from "next/cache";
import { Offer } from "@/types/offerTypes";

export async function addOffer(data: Omit<Offer, "id">): Promise<string> {
  const res = await addDoc(offersRef, {
    ...data,
    createdAt: Date.now(),
  });
  revalidatePath("/offersSet", "page");
  return res.id;
}

export async function upOffer(id: string, data: Partial<Offer>): Promise<void> {
  await updateDoc(doc(offersRef, id), data as any);
  revalidatePath("/offersSet", "page");
}

export async function deleteOffer(id: string): Promise<void> {
  try {
    const docRef = doc(offersRef, id);
    await deleteDoc(docRef);
    revalidatePath("/offersSet", "page");
  } catch (error) {
    console.error("Error deleting offer:", error);
    throw new Error("Failed to delete offer.");
  }
}

export const getOffers = unstable_cache(
  async (): Promise<Offer[]> => {
    try {
      console.log("getOffers");

      const snap = await getDocs(offersRef);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Offer);
    } catch (err) {
      console.error("getOffers error:", err);
      return [];
    }
  },
  ["all-offers"],
  {
    revalidate: 10,
    tags: ["offers"],
  },
);

export async function getOffer(id: string): Promise<Offer | null> {
  try {
    const snap = await getDoc(doc(offersRef, id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Offer) : null;
  } catch (err) {
    console.error("getOffer error:", err);
    return null;
  }
}
