
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireRole } from "@/modules/auth/session";
import { rejectCrossOrigin } from "@/lib/auth/origin";
import { createCheckoutOrder } from "@/modules/orders/order.service";


const schema = z.object({
  addressId: z.string().regex(/^[a-fA-F0-9]{24}$/),
  checkoutKey: z.uuid(),
  paymentMethod: z.literal("cod"),
});

export async function POST(request) {
  const rejected = rejectCrossOrigin(request);
  if (rejected) return rejected;

  const customer = await requireRole("customer");

  if (!customer || customer.status !== "active") {
    return NextResponse.json(
      { message: "Customer login required" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid checkout request" },
      { status: 400 }
    );
  }

  try {
    const order = await createCheckoutOrder({
      customerId: customer._id,
      addressId: parsed.data.addressId,
      checkoutKey: parsed.data.checkoutKey,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order._id.toString(),
        status: order.status,
        paymentStatus: order.paymentStatus,
        currency: order.currency,
        totalMinor: order.totalMinor,
      },
    }, { status: 201 });

  } catch (error) {
    const customerErrors = [
      "ADDRESS_NOT_FOUND",
      "CART_EMPTY",
      "PRODUCT_UNAVAILABLE",
      "INSUFFICIENT_STOCK",
      "MIXED_CURRENCIES",
      "INVALID_QUANTITY",
      "INVALID_TOTAL",
    ];

    if (customerErrors.includes(error.message)) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    console.error("Checkout failed:", error);

    return NextResponse.json(
      { success: false, message: "Checkout failed" },
      { status: 500 }
    );
  }
}
