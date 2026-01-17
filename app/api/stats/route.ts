import { NextResponse } from "next/server";
import { ordersRef, productsRef, usersRef } from "@/lib/firebase";
import {
  getCountFromServer,
  getAggregateFromServer,
  sum,
} from "firebase/firestore";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    // Fetch counts with individual error handling
    const stats = {
      orders: 0,
      products: 0,
      customers: 0,
      revenue: 0,
    };

    // Try to get orders count
    try {
      const ordersSnap = await getCountFromServer(ordersRef);
      stats.orders = ordersSnap.data().count;
    } catch (err) {
      console.error("Error fetching orders count:", err);
    }

    // Try to get products count
    try {
      const productsSnap = await getCountFromServer(productsRef);
      stats.products = productsSnap.data().count;
    } catch (err) {
      console.error("Error fetching products count:", err);
    }

    // Try to get customers count
    try {
      const usersSnap = await getCountFromServer(usersRef);
      stats.customers = usersSnap.data().count;
    } catch (err) {
      console.error("Error fetching customers count:", err);
    }

    // Try to get revenue sum
    try {
      const revenueSnap = await getAggregateFromServer(ordersRef, {
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
    console.error("Stats API Error:", error);
    // Return default values instead of error
    return NextResponse.json(
      {
        orders: 0,
        products: 0,
        customers: 0,
        revenue: 0,
      },
      {
        status: 200, // Return 200 with zeros instead of 500
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      },
    );
  }
}
