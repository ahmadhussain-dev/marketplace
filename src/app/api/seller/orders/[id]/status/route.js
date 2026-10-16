
import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { requireRole } from "@/modules/auth/session";
import { rejectCrossOrigin } from "@/lib/auth/origin";

import { sellerStatusSchema, } from "@/modules/fulfilment/fulfilment.validation";
import { updateFulfillment } from "@/modules/fulfilment/fulfilment.service";



export async function PATCH(request, { params }) {
  const rejected = rejectCrossOrigin(request);
  if (rejected) return rejected;

  const seller = await requireRole("seller");

  if (!seller || seller.status !== "active") {
    return NextResponse.json(
      { message: "Approved seller required" },
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
  const parsed = sellerStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid fulfillment data" },
      { status: 400 }
    );
  }

  try {
    const result = await updateFulfillment({
      seller,
      orderId: id,
      ...parsed.data,
    });

    return NextResponse.json({
      success: true,
      fulfillment: result,
    });
  } catch (error) {
    const knownErrors = {
      STORE_NOT_FOUND: 403,
      ORDER_NOT_FOUND: 404,
      ORDER_CANCELLED: 409,
      INVALID_TRANSITION: 409,
      TRACKING_REQUIRED: 400,
    };

    if (knownErrors[error.message]) {
      return NextResponse.json(
        { message: error.message },
        { status: knownErrors[error.message] }
      );
    }

    console.error("Fulfillment update failed:", error);

    return NextResponse.json(
      { message: "Unable to update fulfillment" },
      { status: 500 }
    );
  }
}
