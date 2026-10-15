
import "server-only";

import { connectDB } from "@/lib/db/mongoose";
import { Category } from "./category.model";

export async function getActiveCategories() {
  await connectDB();

  return Category.find({ isActive: true })
    .sort({ name: 1 })
    .lean();
}

export async function createCategory(data) {
  await connectDB();

  return Category.create(data);
}

export async function categoryExists(id) {
  await connectDB();

  return Category.exists({
    _id: id,
    isActive: true,
  });
}
