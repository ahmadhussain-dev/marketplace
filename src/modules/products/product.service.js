
import "server-only";

import { categoryExists } from "@/modules/categories/category.repository";

import {
  createProduct,
  findSellerProductById,
  updateSellerProduct,
  deleteSellerProduct,
} from "./product.repository";

import {updateProductSchema,
  productSchema,
} from "./product.validation";

export async function addProduct(store, data) {
  if (store.status !== "active") {
    throw new Error("STORE_INACTIVE");
  }

  const parsed = productSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("INVALID_PRODUCT");
  }

  if (!await categoryExists(parsed.data.categoryId)) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  return createProduct({
    ...parsed.data,
    storeId: store._id,
  });
}

export async function editProduct(store, productId, data) {
  if (store.status !== "active") {
    throw new Error("STORE_INACTIVE");
  }

  const current = await findSellerProductById(
    productId,
    store._id
  );

  if (!current) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  // Validate the complete final product, not just
  // the fields supplied in the update.

  const update = updateProductSchema.safeParse(data);

if (!update.success) {
  throw new Error("INVALID_PRODUCT");
}

  const parsed = productSchema.safeParse({
    name: current.name,
    description: current.description,
    categoryId: current.categoryId.toString(),
    sku: current.sku,
    priceMinor: current.priceMinor,
    currency: current.currency,
    stock: current.stock,
    imageUrl: current.imageUrl,
    status: current.status,
    ...data,
  });

  if (!parsed.success) {
    throw new Error("INVALID_PRODUCT");
  }

  if (!await categoryExists(parsed.data.categoryId)) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  return updateSellerProduct(
    productId,
    store._id,
    parsed.data
  );
}

export async function removeProduct(store, productId) {
  const result = await deleteSellerProduct(
    productId,
    store._id
  );

  if (!result) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  return result;
}
