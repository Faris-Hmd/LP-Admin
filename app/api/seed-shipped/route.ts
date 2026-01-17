import { NextResponse } from "next/server";
import { seedShippedOrders } from "@/lib/seedShippedOrders";

export async function GET() {
  try {
    const result = await seedShippedOrders();
    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${result.count} shipped orders`,
      orderIds: result.ids,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to seed orders",
      },
      { status: 500 },
    );
  }
}
