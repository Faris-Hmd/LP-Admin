import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 },
      );
    }

    const [year, month] = date.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const startMillis = startDate.getTime();
    const endMillis = endDate.getTime();

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("status", "==", "Delivered"),
      where("deliveredAt", ">=", startMillis),
      where("deliveredAt", "<=", endMillis),
    );

    const snap = await getDocs(q);
    const statsMap: Record<number, { sales: number; orders: number }> = {};

    snap.forEach((doc) => {
      const data = doc.data();
      const deliveredAt = data.deliveredAt;
      if (!deliveredAt) return;

      const d = new Date(deliveredAt);
      const day = d.getDate();

      const orderTotal = Number(data.totalAmount) || 0;

      if (!statsMap[day]) {
        statsMap[day] = { sales: 0, orders: 0 };
      }

      statsMap[day].sales += orderTotal;
      statsMap[day].orders += 1;
    });

    const daysInMonth = new Date(year, month, 0).getDate();
    const finalData = [];

    for (let i = 1; i <= daysInMonth; i++) {
      finalData.push({
        month: date,
        day: i,
        sales: statsMap[i]?.sales || 0,
        orders: statsMap[i]?.orders || 0,
      });
    }

    return NextResponse.json(finalData, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Sales Stats API Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
