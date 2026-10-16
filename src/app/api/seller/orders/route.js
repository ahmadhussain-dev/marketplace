
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db/mongoose";
import { requireRole } from "@/modules/auth/session";
import { findStoreByOwner } from "@/modules/stores/store.repository";
import { Order } from "@/modules/orders/order.model";



export async function GET() {
  const seller = await requireRole("seller");

  if (!seller || seller.status !== "active") {
    return NextResponse.json(
      { message: "Forbidden" }, { status: 403 }
    );
  }

  const store = await findStoreByOwner(seller._id);

  if (!store || store.status !== "active") {
    return NextResponse.json({
      success: true,
      orders: [],
    });
  }

  await connectDB();

  const orders = await Order.find({
    "fulfillmentGroups.storeId": store._id,
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const results = orders.flatMap(order =>
    order.fulfillmentGroups
      .filter(group => group.storeId.equals(store._id))
      .map(group => ({
        orderId: order._id.toString(),
        fulfillmentId: group._id.toString(),
        status: group.status,
        currency: order.currency,
        subtotalMinor: group.subtotalMinor,
        createdAt: order.createdAt,
        items: group.items.map(item => ({
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
        })),
      }))
  );

  return NextResponse.json({
    success: true,
    orders: results,
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
