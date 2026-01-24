import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const ordersRef = collection(db, "orders");
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
      const data = doc.data();
      const offerId = data.offerId || "unknown";
      const offerTitle = data.offerTitle || "عرض غير معروف";
      const amount = Number(data.totalAmount) || 0;

      if (!statsMap[offerId]) {
        statsMap[offerId] = { title: offerTitle, count: 0, revenue: 0 };
      }

      statsMap[offerId].count += 1;
      statsMap[offerId].revenue += amount;
    });

    const result = Object.entries(statsMap)
      .map(([id, stats]) => ({
        offerId: id,
        offerTitle: stats.title,
        count: stats.count,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Offers Stats API Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
