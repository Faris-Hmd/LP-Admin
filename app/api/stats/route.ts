import { NextResponse } from "next/server";
import { ordersRef, productsRef, usersRef } from "@/lib/firebase";
import {
  getCountFromServer,
  getAggregateFromServer,
  sum,
} from "firebase/firestore";

export async function GET() {
  try {
    // We add the aggregate call to the Promise.all array
    const [ordersSnap, productsSnap, usersSnap, revenueSnap] =
      await Promise.all([
        getCountFromServer(ordersRef),
        getCountFromServer(productsRef),
        getCountFromServer(usersRef),
        getAggregateFromServer(ordersRef, {
          totalRevenue: sum("totalAmount"), // Aggregating the 'totalAmount' field
        }),
      ]);

    const stats = {
      orders: ordersSnap.data().count,
      products: productsSnap.data().count,
      customers: usersSnap.data().count,
      revenue: revenueSnap.data().totalRevenue, // Extracting the sum
    };

    return NextResponse.json(stats, {
      status: 200,
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
