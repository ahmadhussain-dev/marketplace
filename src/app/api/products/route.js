import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { findPublicProducts } from "@/modules/products/product.repository";
import { serializeProduct } from "@/modules/products/product.serializer";

export async function GET(request) {
  const params  = new URL(request.url).searchParams;
  const search = (params.get("search") || "").trim().slice(0,80);
  const categoryId = params.get("category" || "");

  if(categoryId && !mongoose.isObjectIdOrHexString(categoryId)) {
    NextResponse.json(
      {
        message: "Invalid category Id"
      },
      {status: 400}
    );
  }
  const rawPage = Number(params.get("page") || 1);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 1000) : 1;
  const limit = 12;

  const result = await findPublicProducts({
    search,
    categoryId,
    page,
    limit,
  });

  const products = result.products.filter(product => product.storeId?.status === "active").map(serializeProduct);
  return NextResponse.json(
    {
      succes: true,
      products,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    }
  );
}