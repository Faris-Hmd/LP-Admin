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
  orderBy,
} from "firebase/firestore";
import { ordersRef } from "@/lib/firebase";
import { revalidatePath, unstable_cache } from "next/cache";
import { OrderData } from "@/types/productsTypes";

/**
 * GET ALL ORDERS: For dashboard metrics
 */
export async function getAllOrders(): Promise<OrderData[]> {
  // console.log("get all orders from server");
  try {
    const snap = await getDocs(ordersRef);
    return snap.docs.map((d) => ({
      ...d.data(),
      id: d.id,
      deleveratstamp: "",
    })) as OrderData[];
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

        return snap.docs.map((d) => ({
          ...d.data(),
          id: d.id,
          deleveratstamp: "",
        })) as OrderData[];
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
export async function getOrdersWhOrdered(
  filters: OrderFilter[],
): Promise<OrderData[]> {
  // console.log("get where order from server");

  try {
    // 1. Map our filter objects into Firestore where() constraints
    const constraints: QueryConstraint[] = filters.map((f) =>
      where(f.field as string, f.op, f.val),
    );

    // 2. Create the query with all constraints spread into the function
    const q = query(
      ordersRef,
      ...constraints,
      orderBy("deleveratstamp", "asc"),
    );

    // 3. Execute
    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      return {
        ...d.data(),
        id: d.id,
        deleveratstamp: "",
      } as OrderData;
    });
  } catch (error) {
    console.error("Firestore Query Error:", error);
    return [];
  }
}

/**
 * GET: Returns a strictly typed OrderData or null
 */
export async function getOrder(id: string): Promise<OrderData | null> {
  const snap = await getDoc(doc(ordersRef, id));
  if (!snap.exists()) return null;
  // console.log("get order from server ", id);

  return {
    ...snap.data(),
    id: snap.id,
  } as OrderData;
}

/**
 * ADD: Omit orderId because Firestore generates it
 */
export async function addOrder(data: Omit<OrderData, "id">): Promise<string> {
  const res = await addDoc(ordersRef, data);
  // console.log("add order from server");

  revalidatePath("/orders");
  return res.id;
}

/**
 * UPDATE: Uses Partial<OrderData> to allow updating only specific fields safely
 */
export async function upOrder(
  id: string,
  data: Partial<OrderData>,
): Promise<void> {
  // We cast to any here only because Firestore's updateDoc type is very broad,
  // but our function argument 'data' remains strictly typed for the caller.
  await updateDoc(doc(ordersRef, id), data as any);
  // console.log("up order from server");

  revalidatePath("/orders");
}

/**
 * DELETE
 */
export async function delOrder(id: string): Promise<void> {
  await deleteDoc(doc(ordersRef, id));
  // console.log("del order from server");
  revalidatePath("/orders");
}

/**
 * QUERY: Returns an array of typed OrderData
 */
type OrderFilter = {
  field: keyof OrderData;
  op: WhereFilterOp;
  val: any;
};
