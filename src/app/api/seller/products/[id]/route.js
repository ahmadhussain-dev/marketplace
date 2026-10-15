
import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { rejectCrossOrigin } from "@/lib/auth/origin";
import { getApprovedSellerStore } from "@/modules/products/seller-access";

import {
  editProduct,
  removeProduct,
} from "@/modules/products/product.service";

import { serializeProduct } from "@/modules/products/product.serializer";



async function getContext(request, params) {
  const rejected = rejectCrossOrigin(request);
  if (rejected) return { error: rejected };

  const store = await getApprovedSellerStore();

  if (!store) {
    return {
      error: NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  const { id } = await params;

  if (!mongoose.isObjectIdOrHexString(id)) {
    return {
      error: NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      ),
    };
  }

  return { store, id };
}

function handleError(error) {
  if (error.code === 11000) {
    return NextResponse.json(
      { message: "Duplicate SKU" },
      { status: 409 }
    );
  }

  if (error.message === "PRODUCT_NOT_FOUND") {
    return NextResponse.json(
      { message: "Product not found" },
      { status: 404 }
    );
  }

  if (["INVALID_PRODUCT", "CATEGORY_NOT_FOUND"].includes(error.message)) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }

  console.error("Product operation failed:", error);

  return NextResponse.json(
    { message: "Product operation failed" },
    { status: 500 }
  );
}

export async function PATCH(request, { params }) {
  const context = await getContext(request, params);
  if (context.error) return context.error;

  const body = await request.json().catch(() => null);

  try {
    const product = await editProduct(
      context.store,
      context.id,
      body
    );

    return NextResponse.json({
      success: true,
      product: serializeProduct(product),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request, { params }) {
  const context = await getContext(request, params);
  if (context.error) return context.error;

  try {
    await removeProduct(context.store, context.id);

    return NextResponse.json({
      success: true,
      message: "Product removed",
    });
  } catch (error) {
    return handleError(error);
  }
}
