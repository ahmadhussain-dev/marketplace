
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { requireRole } from "@/modules/auth/session";
import { Order } from "@/modules/orders/order.model";



export async function GET() {
  const user = await requireRole("customer");

  if (!user || user.status !== "active") {
    return NextResponse.json(
      { message: "Unauthorized" }, { status: 401 }
    );
  }

  await connectDB();

  const orders = await Order.find({
    customerId: user._id,
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json({
    success: true,
    orders: orders.map(order => ({
      id: order._id.toString(),
      currency: order.currency,
      totalMinor: order.totalMinor,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      items: order.fulfillmentGroups.flatMap(
        group => group.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unitPriceMinor: item.unitPriceMinor,
        }))
      ),
    })),
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
