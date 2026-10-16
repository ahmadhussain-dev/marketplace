
import { NextResponse } from "next/server";

import { requireRole } from "@/modules/auth/session";
import { getAdminOrders } from "@/modules/fulfilment/fulfilment.repository";



export async function GET() {
  const admin = await requireRole("admin");

  if (!admin || admin.status !== "active") {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }

  const orders = await getAdminOrders();

  const response = NextResponse.json({
    success: true,

    orders: orders.map(order => ({
      id: order._id.toString(),
      customerId: order.customerId.toString(),
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      currency: order.currency,
      totalMinor: order.totalMinor,
      createdAt: order.createdAt,
      fulfillmentGroups: order.fulfillmentGroups.map(
        group => ({
          id: group._id.toString(),
          storeId: group.storeId.toString(),
          status: group.status,
          subtotalMinor: group.subtotalMinor,
        })
      ),
    })),
  });

  response.headers.set("Cache-Control", "no-store");

  return response;
}
