
import "server-only";

import mongoose from "mongoose";

import { connectDB } from "@/lib/db/mongoose";
import { Order } from "@/modules/orders/order.model";
import { getSellerStore } from "./fulfilment.repository";

const nextStatus = {
  pending: "processing",
  processing: "shipped",
  shipped: "delivered",
};

export async function updateFulfillment({
  seller,
  orderId,
  status,
  trackingNumber,
  carrierName,
}) {
  await connectDB();

  const store = await getSellerStore(seller._id);

  if (!store) {
    throw new Error("STORE_NOT_FOUND");
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const order = await Order.findById(orderId)
        .session(session);

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (order.status === "cancelled") {
        throw new Error("ORDER_CANCELLED");
      }

      const group = order.fulfillmentGroups.find(
        group => group.storeId.toString() ===
          store._id.toString()
      );

      if (!group) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (nextStatus[group.status] !== status) {
        throw new Error("INVALID_TRANSITION");
      }

      if (status === "shipped") {
        if (!carrierName || !trackingNumber) {
          throw new Error("TRACKING_REQUIRED");
        }

        group.carrierName = carrierName;
        group.trackingNumber = trackingNumber;
        group.shippedAt = new Date();
      }

      if (status === "delivered") {
        group.deliveredAt = new Date();
      }

      group.status = status;

      order.events.push({
        actorId: seller._id,
        actorRole: "seller",
        event: `fulfillment.${status}`,
        fulfillmentId: group._id,
      });

      const statuses = order.fulfillmentGroups.map(
        group => group.status
      );

      if (statuses.every(value => value === "delivered")) {
        order.status = "completed";
      } else if (statuses.some(value =>
        ["processing", "shipped", "delivered"].includes(value)
      )) {
        order.status = "processing";
      }

      await order.save({ session });

      result = {
        orderId: order._id.toString(),
        fulfillmentId: group._id.toString(),
        status: group.status,
        orderStatus: order.status,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
}
