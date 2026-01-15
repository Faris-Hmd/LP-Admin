// app/api/stats/categories/route.ts
import { NextResponse } from "next/server";
import { productsRef } from "@/lib/firebase";
import { getCountFromServer, query, where } from "firebase/firestore";
import { categories } from "@/data/categories";

export async function GET() {
  try {
    const categorySubset = categories.slice(0, 16);

    const results = await Promise.all(
      categorySubset.map(async (category) => {
        const q = query(productsRef, where("p_cat", "==", category));
        const snap = await getCountFromServer(q);

        return {
          category,
          quantity: snap.data().count,
          // We don't need 'fill' here anymore if using a uniform gradient
        };
      }),
    );

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "ERR_FETCH" }, { status: 500 });
  }
}
