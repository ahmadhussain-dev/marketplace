import { NextResponse } from "next/server";
import { getActiveCategories } from "@/modules/categories/category.repository";

export async function GET() {
  const categories = await getActiveCategories();
  return NextResponse.json({
    success: true,
    categories: categories.map((category) => ({
      id: category._id.toString(),
      name: category.name.trim(),
      slug: category.slug,

    })),
  });
}
