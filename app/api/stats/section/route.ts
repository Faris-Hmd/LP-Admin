import { NextResponse } from "next/server";
import { ordersRef, productsRef, usersRef } from "@/lib/firebase";
import {
  getCountFromServer,
  getAggregateFromServer,
  sum,
  query,
  where,
} from "firebase/firestore";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const stats = {
      orders: 0,
      products: 0,
      customers: 0,
      revenue: 0,
    };

    // Filter only Delivered orders for accuracy
    const deliveredQuery = query(ordersRef, where("status", "==", "Delivered"));

    // 1. Orders Count (Delivered)
    try {
      const ordersSnap = await getCountFromServer(deliveredQuery);
      stats.orders = ordersSnap.data().count;
    } catch (err) {
      console.error("Error fetching orders count:", err);
    }

    // 2. Products Count
    try {
      const productsSnap = await getCountFromServer(productsRef);
      stats.products = productsSnap.data().count;
    } catch (err) {
      console.error("Error fetching products count:", err);
    }

    // 3. Customers Count
    try {
      const usersSnap = await getCountFromServer(usersRef);
      stats.customers = usersSnap.data().count;
    } catch (err) {
      console.error("Error fetching customers count:", err);
    }

    // 4. Revenue Sum (Delivered)
    try {
      const revenueSnap = await getAggregateFromServer(deliveredQuery, {
        totalRevenue: sum("totalAmount"),
      });
      stats.revenue = revenueSnap.data().totalRevenue || 0;
    } catch (err) {
      console.error("Error fetching revenue:", err);
    }

    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Section Stats API Error:", error);
    return NextResponse.json(
      { orders: 0, products: 0, customers: 0, revenue: 0 },
      { status: 200 },
    );
  }
}
