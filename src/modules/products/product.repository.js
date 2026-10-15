
import "server-only";

import { connectDB } from "@/lib/db/mongoose";
import { Product } from "./product.model";

export async function createProduct(data) {
  await connectDB();
  return Product.create(data);
}

export async function findSellerProducts(storeId) {
  await connectDB();

  return Product.find({
    storeId,
    isDeleted: false,
  }).sort({ createdAt: -1 }).lean();
}

export async function findSellerProductById(id, storeId) {
  await connectDB();

  return Product.findOne({
    _id: id,
    storeId,
    isDeleted: false,
  });
}

export async function updateSellerProduct(
  id,
  storeId,
  data
) {
  await connectDB();

  return Product.findOneAndUpdate(
    { _id: id, storeId, isDeleted: false },
    { $set: data },
    { new: true, runValidators: true }
  );
}

export async function deleteSellerProduct(
  id,
  storeId
) {
  await connectDB();

  return Product.findOneAndUpdate(
    { _id: id, storeId, isDeleted: false },
    { $set: { isDeleted: true, status: "draft" } },
    { new: true }
  );
}

export async function findPublicProducts({
  search,
  categoryId,
  page,
  limit,
}) {
  await connectDB();

  const filter = {
    status: "published",
    isDeleted: false,
    stock: { $gt: 0 },
  };

  if (categoryId) {
    filter.categoryId = categoryId;
  }

  if (search) {
    filter.name = {
      $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name")
      .populate("storeId", "name status")
      .lean(),

    Product.countDocuments(filter),
  ]);

  return { products, total };
}
