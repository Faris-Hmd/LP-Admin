"use server";

import { driversRef } from "@/lib/firebase";
import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { revalidatePath, unstable_cache } from "next/cache";
import { Driver } from "@/types/userTypes";

/**
 * GET ALL DRIVERS
 */
export const getDrivers = async (): Promise<Driver[]> => {
  const cachedFetch = unstable_cache(
    async () => {
      try {
        console.log("🚚 FIREBASE FETCH: Drivers List"); // Only logs on cache miss
        const snap = await getDocs(driversRef);
        return snap.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        })) as Driver[];
      } catch (error) {
        console.error("Error fetching drivers:", error);
        return [];
      }
    },
    ["drivers-list-cache"], // Static unique key
    {
      revalidate: 3600, // Optional: Cache for 1 hour
      tags: ["drivers"], // Tag for manual revalidation
    },
  );

  return cachedFetch();
};

/**
 * GET SINGLE DRIVER
 */
export const getDriver = async (id: string): Promise<Driver | null> => {
  try {
    const snap = await getDoc(doc(driversRef, id));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as Driver;
  } catch (error) {
    console.error("Error fetching driver:", error);
    return null;
  }
};

/**
 * GET DRIVER BY EMAIL
 */
export const getDriverByEmail = async (
  email: string,
): Promise<Driver | null> => {
  try {
    const q = query(driversRef, where("email", "==", email));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { ...d.data(), id: d.id } as Driver;
  } catch (error) {
    console.error("Error fetching driver by email:", error);
    return null;
  }
};

/**
 * ADD DRIVER
 */
export const addDriver = async (
  data: Omit<Driver, "id">,
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const res = await addDoc(driversRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    revalidatePath("/drivers");
    return { success: true, id: res.id };
  } catch (error) {
    console.error("Error adding driver:", error);
    return { success: false, error: "Failed to add driver" };
  }
};

/**
 * UPDATE DRIVER
 */
export const upDriver = async (
  id: string,
  data: Partial<Driver>,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateDoc(doc(driversRef, id), {
      ...data,
      updatedAt: new Date().toISOString(),
    } as any);
    revalidatePath("/drivers");
    return { success: true };
  } catch (error) {
    console.error("Error updating driver:", error);
    return { success: false, error: "Failed to update driver" };
  }
};

/**
 * DELETE DRIVER
 */
export const delDriver = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await deleteDoc(doc(driversRef, id));
    revalidatePath("/drivers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting driver:", error);
    return { success: false, error: "Failed to delete driver" };
  }
};
