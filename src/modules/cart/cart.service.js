
import "server-only";

import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { Cart } from "./cart.model";
import { Product } from "@/modules/products/product.model";
import { Store } from "@/modules/stores/store.model";
import { User } from "@/modules/users/user.model";

export async function getCart(customerId) {
  await connectDB();

  const cart = await Cart.findOne({ customerId }).lean();

  if (!cart) return { items: [], subtotalMinor: 0, currency: null };

  const ids = cart.items.map(item => item.productId);

  const products = await Product.find({
    _id: { $in: ids },
    isDeleted: false,
    status: "published",
  }).lean();

  const stores = await Store.find({
    _id: { $in: products.map(p => p.storeId) },
    status: "active",
  }).lean();

  const storeIds = stores.map(s => s._id);

  const productMap = new Map(
    products
      .filter(p => storeIds.some(id => id.equals(p.storeId)))
      .map(p => [p._id.toString(), p])
  );

  const items = cart.items.map(item => {
    const product = productMap.get(item.productId.toString());

    return {
      productId: item.productId.toString(),
      quantity: item.quantity,
      name: product?.name ?? "Unavailable product",
      priceMinor: product?.priceMinor ?? 0,
      currency: product?.currency ?? null,
      stock: product?.stock ?? 0,
      imageUrl: product?.imageUrl ?? "",
      available: Boolean(product) &&
        product.stock >= item.quantity,
    };
  });

  const currencies = [...new Set(
    items.filter(i => i.available).map(i => i.currency)
  )];

  const subtotalMinor = currencies.length === 1
    ? items.reduce((sum, item) =>
        sum + (item.available
          ? item.priceMinor * item.quantity
          : 0), 0)
    : null;

  return {
    items,
    subtotalMinor,
    currency: currencies.length === 1 ? currencies[0] : null,
  };
}

export async function changeCartItem(customerId, productId, quantity) {
  await connectDB();

  if (!mongoose.isObjectIdOrHexString(productId)) {
    throw new Error("INVALID_PRODUCT");
  }

  if (quantity > 0) {
    const product = await Product.findOne({
      _id: productId,
      status: "published",
      isDeleted: false,
    });

    if (!product || product.stock < quantity) {
      throw new Error("PRODUCT_UNAVAILABLE");
    }

    const store = await Store.findOne({
      _id: product.storeId,
      status: "active",
    });

    const owner = store && await User.findOne({
      _id: store.ownerId,
      role: "seller",
      status: "active",
    });

    if (!owner) throw new Error("PRODUCT_UNAVAILABLE");
  }

  // Serialize modifications to a single customer's cart.
  // This starter also enforces uniqueness via the cart index.
  let cart = await Cart.findOne({ customerId });

  if (!cart) {
    try {
      cart = await Cart.create({ customerId, items: [] });
    } catch (error) {
      if (error.code !== 11000) throw error;
      cart = await Cart.findOne({ customerId });
    }
  }

  const index = cart.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (quantity === 0) {
    if (index !== -1) cart.items.splice(index, 1);
  } else if (index !== -1) {
    cart.items[index].quantity = quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  await cart.save();

  return getCart(customerId);
}
