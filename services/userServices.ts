"use server";

import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { UserData } from "@/types/userTypes";

const COL = "users";

/**
 * GET: Returns user data including shipping info
 */
export async function getUser(email: string): Promise<UserData | null> {
  if (!email) return null;

  try {
    const snap = await getDoc(doc(db, COL, email));
    if (!snap.exists()) return null;

    return {
      ...snap.data(),
      email: snap.id,
    } as UserData;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

/**
 * UPDATE: Merges user data (usually shipping info)
 */
export async function upUser(
  email: string,
  data: Partial<UserData>,
): Promise<{ success: boolean; error?: string }> {
  if (!email) return { success: false, error: "Email required" };

  try {
    const userRef = doc(db, COL, email);
    await setDoc(
      userRef,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating user data:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * GET: Returns all users
 */

export async function getUsers(): Promise<UserData[]> {
  try {
    const q = query(collection(db, COL));
    const snap = await getDocs(q);

    return snap.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          email: doc.id,
        }) as UserData,
    );
  } catch (error) {
    // console.error("Error fetching users:", error);
    return [];
  }
}
