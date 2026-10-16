import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { requireRole } from "@/modules/auth/session";
import { rejectCrossOrigin } from "@/lib/auth/origin";
import { connectDB } from "@/lib/db/mongoose";
import { Order } from "@/modules/orders/order.model";
import { codConfirmationSchema } from "@/modules/fulfilment/fulfilment.validation";

export async function POST(request, { params }) {
  const rejected = rejectCrossOrigin(request);
  if (rejected) return rejected;

  const admin = await requireRole("admin");

  if (!admin || admin.status !== "active") {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }

  const { id } = await params;

  if (!mongoose.isObjectIdOrHexString(id)) {
    return NextResponse.json(
      { message: "Invalid order ID" },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = codConfirmationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Valid collection reference required" },
      { status: 400 }
    );
  }

  await connectDB();

  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: id,
        paymentMethod: "cod",
        paymentStatus: "pending",
        status: "completed",
        "fulfillmentGroups.0": { $exists: true },
        fulfillmentGroups: {
          $not: {
            $elemMatch: { status: { $ne: "delivered" } },
          },
        },
      },
      {
        $set: {
          paymentStatus: "paid",
          codCollectionReference:
            parsed.data.collectionReference,
          codConfirmedAt: new Date(),
          codConfirmedBy: admin._id,
        },
        $push: {
          events: {
            actorId: admin._id,
            actorRole: "admin",
            event: "payment.cod_confirmed",
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        {
          message:
            "Order unavailable, not fully delivered, or payment already confirmed",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order._id.toString(),
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    console.error("COD confirmation failed:", error);

    return NextResponse.json(
      { message: "Unable to confirm COD collection" },
      { status: 500 }
    );
  }
}