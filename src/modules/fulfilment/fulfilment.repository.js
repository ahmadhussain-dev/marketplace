
import "server-only";

import { connectDB } from "@/lib/db/mongoose";

// Import database models, NOT Lucide icons.
import { Store } from "@/modules/stores/store.model";
import { Order } from "@/modules/orders/order.model";

// Get the approved seller's active store.
export async function getSellerStore(sellerId) {
  await connectDB();

  return Store.findOne({
    ownerId: sellerId,
    status: "active",
  });
}

// Find an order by its MongoDB ID.
export async function getOrderById(id, session = null) {
  await connectDB();

  return Order.findById(id).session(session);
}

// Retrieve recent orders for administrators.
export async function getAdminOrders() {
  await connectDB();

  return Order.find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
}
