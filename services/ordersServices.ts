"use server";

import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  WhereFilterOp,
  QueryConstraint,
} from "firebase/firestore";
import { ordersRef } from "@/lib/firebase";
import { revalidatePath, unstable_cache } from "next/cache";
import { OrderData } from "@/types/productsTypes";
import { log } from "console";

const toMillis = (val: any): number => {
  if (!val) return 0;
  if (typeof val === "number") return val;
  // Firestore Timestamp
  if (val.toMillis && typeof val.toMillis === "function") return val.toMillis();
  // JS Date
  if (val.getTime && typeof val.getTime === "function") return val.getTime();
  // Check for { seconds, nanoseconds } object (serialized timestamp)
  if (typeof val.seconds === "number" && typeof val.nanoseconds === "number") {
    return val.seconds * 1000 + val.nanoseconds / 1000000;
  }
  // Fallback to string parsing
  return new Date(val).getTime() || 0;
};

const sanitizeOrder = (docId: string, data: any): OrderData => {
  // Deep clean to ensure all Firestore types are converted
  const cleanData = { ...data };

  // 1. Convert Top-level Dates
  cleanData.createdAt = toMillis(cleanData.createdAt);
  if (cleanData.deliveredAt) {
    cleanData.deliveredAt = toMillis(cleanData.deliveredAt);
  }

  // 2. Convert Dates in Products List
  if (Array.isArray(cleanData.productsList)) {
    cleanData.productsList = cleanData.productsList.map((p: any) => {
      const cleanProduct = { ...p };
      if (cleanProduct.createdAt) {
        cleanProduct.createdAt = toMillis(cleanProduct.createdAt);
      }
      return cleanProduct;
    });
  }

  // 3. Ensure ID is attached
  cleanData.id = docId;

  // 4. Final Safety: JSON cycle to strip any hidden non-serializable prototypes
  return JSON.parse(JSON.stringify(cleanData)) as OrderData;
};

/**
 * GET ALL ORDERS: For dashboard metrics
 */
export async function getAllOrders(): Promise<OrderData[]> {
  // console.log("get all orders from server");
  try {
    const snap = await getDocs(ordersRef);
    return snap.docs.map((d) => sanitizeOrder(d.id, d.data()));
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }
}
export const getOrdersWh = async (filters: OrderFilter[]) => {
  // Generate a unique cache key based on the filter values
  const filterKey = JSON.stringify(filters);
  return unstable_cache(
    async (): Promise<OrderData[]> => {
      console.log("get orders where from server");

      try {
        const constraints: QueryConstraint[] = filters.map((f) =>
          where(f.field as string, f.op, f.val),
        );

        const q = query(ordersRef, ...constraints);
        const snap = await getDocs(q);

        return snap.docs.map((d) => sanitizeOrder(d.id, d.data()));
      } catch (error) {
        console.error("Firestore Query Error:", error);
        return [];
      }
    },
    ["orders-where", filterKey], // Unique key: identifier + specific filter string
    {
      revalidate: 30, // Cache for 1 hour by default
      tags: ["orders"], // Generic tag for global revalidation
    },
  )();
};

/**
 * GET: Returns a strictly typed OrderData or null
 */
export async function getOrder(id: string): Promise<OrderData | null> {
  const snap = await getDoc(doc(ordersRef, id));
  if (!snap.exists()) return null;
  console.log("get order from server", snap.data());
  return sanitizeOrder(snap.id, snap.data());
}

/**
 * ADD: Omit orderId because Firestore generates it
 */
export async function addOrder(data: Omit<OrderData, "id">): Promise<string> {
  const res = await addDoc(ordersRef, data);
  // console.log("add order from server");

  revalidatePath(`/manageOrder`);
  return res.id;
}

/**
 * UPDATE: Uses Partial<OrderData> to allow updating only specific fields safely
 */
export async function upOrder(
  id: string,
  data: Partial<OrderData>,
): Promise<void> {
  // If status is becoming "Delivered", capture the timestamp
  if (data.status === "Delivered") {
    data.deliveredAt = Date.now();
  }

  // We cast to any here only because Firestore's updateDoc type is very broad,
  // but our function argument 'data' remains strictly typed for the caller.
  await updateDoc(doc(ordersRef, id), data as any);
  // console.log("up order from server");

  revalidatePath(`/manageOrder`);
}

/**
 * DELETE
 */
export async function delOrder(id: string): Promise<void> {
  await deleteDoc(doc(ordersRef, id));
  // console.log("del order from server");
  revalidatePath(`/manageOrder`);
}

/**
 * QUERY: Returns an array of typed OrderData
 */
/**
 * ANALYTICS: Get aggregated stats for offers
 */
export async function getOfferStats() {
  try {
    // Query only delivered offer orders for accurate revenue stats
    // We can also include all orders if we just want "popularity" regardless of delivery status
    // For now, let's fetch ALL orders that are offers to check popularity
    const q = query(
      ordersRef,
      where("isOffer", "==", true),
      where("status", "==", "Delivered"),
    );
    const snap = await getDocs(q);

    const statsMap: Record<
      string,
      { title: string; count: number; revenue: number }
    > = {};

    snap.forEach((doc) => {
      const data = doc.data() as OrderData;
      const offerId = data.offerId || "unknown";
      const offerTitle = data.offerTitle || "عرض غير معروف";
      const amount = Number(data.totalAmount) || 0;

      if (!statsMap[offerId]) {
        statsMap[offerId] = { title: offerTitle, count: 0, revenue: 0 };
      }

      statsMap[offerId].count += 1;
      statsMap[offerId].revenue += amount;
    });

    // Convert to array and sort by count desc
    return Object.entries(statsMap)
      .map(([id, stats]) => ({
        offerId: id,
        offerTitle: stats.title,
        count: stats.count,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("Error fetching offer stats:", error);
    return [];
  }
}

type OrderFilter = {
  field: keyof OrderData;
  op: WhereFilterOp;
  val: any;
};
