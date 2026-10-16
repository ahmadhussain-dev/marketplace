import { NextResponse } from "next/server";
import {z} from "zod";

import { requireRole } from "@/modules/auth/session";
import { rejectCrossOrigin } from "@/lib/auth/origin";
import { getCart, changeCartItem } from "@/modules/cart/cart.service";

const itemSchema = z.object({
  productId: z.string().regex(/^[a-fA-F0-9]{24}$/),
  quantity: z.number().int().min(0).max(99),
});

async function customer() {
  const user = await requireRole("customer");
  return user?.status === "active" ? user : null;
}
export async function GET() {
  const user = await customer();
  if(!user) {
    return NextResponse.json(
        { message: "Customer login required" },
      { status: 401 }
    );

  }

  return NextResponse.json(
    {
      success: "true", cart: await getCart(user._id)
    },
    {
      headers: {"Cache-Control": "no-store"}
    }
  );
}

export async function PUT(request) {
  const rejected = await rejectCrossOrigin(request);
  if(rejected) return rejected;
  const user = await customer();
  if(!user) {
    return NextResponse.json({ message: "Customer login required"}, {status: 401});
  }
  const body = await request.json().catch(() => null);
  const parsed = await itemSchema.safeParse(body);
  if(!parsed.success){
     return NextResponse.json(
      { message: "Invalid cart item" },
      { status: 400 }
    );
  }

  try {
     const cart = await changeCartItem(
      user._id,
      parsed.data.productId,
      parsed.data.quantity
    );

    return NextResponse.json({ success: true, cart });
  } catch (error) {
      if (["INVALID_PRODUCT", "PRODUCT_UNAVAILABLE"].includes(error.message)) {
      return NextResponse.json(
        { message: "Product or quantity unavailable" },
        { status: 400 }
      );
    }

    console.error("Cart update failed:", error);

    return NextResponse.json(
      { message: "Unable to update cart" },
      { status: 500 }
    );
  }
}