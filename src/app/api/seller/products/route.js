
import { NextResponse } from "next/server";

import { rejectCrossOrigin } from "@/lib/auth/origin";
import { getApprovedSellerStore } from "@/modules/products/seller-access";
import { addProduct } from "@/modules/products/product.service";
import { findSellerProducts } from "@/modules/products/product.repository";
import { serializeProduct } from "@/modules/products/product.serializer";



export async function GET() {
  const store = await getApprovedSellerStore();

  if (!store) {
    return NextResponse.json(
      { message: "Approved seller store required" },
      { status: 403 }
    );
  }

  const products = await findSellerProducts(store._id);

  return NextResponse.json({
    success: true,
    products: products.map(serializeProduct),
  });
}

export async function POST(request) {
  const rejected = rejectCrossOrigin(request);
  if (rejected) return rejected;

  const store = await getApprovedSellerStore();

  if (!store) {
    return NextResponse.json(
      { message: "Approved seller store required" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);

  try {
    const product = await addProduct(store, body);

    return NextResponse.json(
      {
        success: true,
        product: serializeProduct(product),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "SKU already exists in this store" },
        { status: 409 }
      );
    }

    if (error.message === "INVALID_PRODUCT" ||
        error.message === "CATEGORY_NOT_FOUND") {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    console.error("Product creation failed:", error);

    return NextResponse.json(
      { message: "Unable to create product" },
      { status: 500 }
    );
  }
}
