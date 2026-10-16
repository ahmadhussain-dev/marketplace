
import "server-only";

import mongoose from "mongoose";

import { connectDB } from "@/lib/db/mongoose";
import { Cart } from "@/modules/cart/cart.model";
import { Address } from "@/modules/addresses/address.model";
import { Product } from "@/modules/products/product.model";
import { Store } from "@/modules/stores/store.model";
import { User } from "@/modules/users/user.model";
import { Order } from "./order.model";

export async function createCheckoutOrder({
  customerId,
  addressId,
  checkoutKey,
}) {
  await connectDB();

  const existing = await Order.findOne({
    customerId,
    checkoutKey,
  });

  if (existing) return existing;

  const session = await mongoose.startSession();

  try {
    let createdOrder;

    await session.withTransaction(async () => {
      const duplicate = await Order.findOne({
        customerId,
        checkoutKey,
      }).session(session);

      if (duplicate) {
        createdOrder = duplicate;
        return;
      }

      const address = await Address.findOne({
        _id: addressId,
        customerId,
      }).session(session).lean();

      if (!address) throw new Error("ADDRESS_NOT_FOUND");

      const cart = await Cart.findOne({
        customerId,
      }).session(session);

      if (!cart || cart.items.length === 0) {
        throw new Error("CART_EMPTY");
      }

      const groups = new Map();
      let currency = null;
      let subtotalMinor = 0;

      // Sort by ID for a consistent update order.
      const cartItems = [...cart.items].sort((a, b) =>
        a.productId.toString().localeCompare(
          b.productId.toString()
        )
      );

      for (const item of cartItems) {
        const quantity = item.quantity;

        if (!Number.isInteger(quantity) ||
            quantity < 1 || quantity > 99) {
          throw new Error("INVALID_QUANTITY");
        }

        const product = await Product.findOne({
          _id: item.productId,
          status: "published",
          isDeleted: false,
        }).session(session);

        if (!product) throw new Error("PRODUCT_UNAVAILABLE");

        const store = await Store.findOne({
          _id: product.storeId,
          status: "active",
        }).session(session);

        if (!store) throw new Error("PRODUCT_UNAVAILABLE");

        const seller = await User.findOne({
          _id: store.ownerId,
          role: "seller",
          status: "active",
        }).session(session);

        if (!seller) throw new Error("PRODUCT_UNAVAILABLE");

        if (currency && currency !== product.currency) {
          throw new Error("MIXED_CURRENCIES");
        }

        currency = product.currency;

        const updated = await Product.updateOne(
          {
            _id: product._id,
            status: "published",
            isDeleted: false,
            stock: { $gte: quantity },
          },
          { $inc: { stock: -quantity } },
          { session }
        );

        if (updated.modifiedCount !== 1) {
          throw new Error("INSUFFICIENT_STOCK");
        }

        const lineTotalMinor = product.priceMinor * quantity;

        if (!Number.isSafeInteger(lineTotalMinor)) {
          throw new Error("INVALID_TOTAL");
        }

        subtotalMinor += lineTotalMinor;

        if (!Number.isSafeInteger(subtotalMinor)) {
          throw new Error("INVALID_TOTAL");
        }

        const storeId = store._id.toString();

        if (!groups.has(storeId)) {
          groups.set(storeId, {
            storeId: store._id,
            items: [],
            subtotalMinor: 0,
            status: "pending",
          });
        }

        const group = groups.get(storeId);

        group.items.push({
          productId: product._id,
          name: product.name,
          sku: product.sku,
          quantity,
          unitPriceMinor: product.priceMinor,
          lineTotalMinor,
        });

        group.subtotalMinor += lineTotalMinor;
      }

      // Development-only placeholder values.
      // Actual rates and taxes must be calculated
      // before real customer orders are accepted.
      const shippingMinor = 0;
      const taxMinor = 0;

      const totalMinor =
        subtotalMinor + shippingMinor + taxMinor;

      const [order] = await Order.create(
        [{
          customerId,
          checkoutKey,
          fulfillmentGroups: [...groups.values()],
          shippingAddress: {
            fullName: address.fullName,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            region: address.region,
            postalCode: address.postalCode,
            country: address.country,
          },
          currency,
          subtotalMinor,
          shippingMinor,
          taxMinor,
          totalMinor,
          paymentMethod: "cod",
          paymentStatus: "pending",
          status: "pending",
        }],
        { session }
      );

      await Cart.deleteOne({ _id: cart._id }).session(session);

      createdOrder = order;
    });

    return createdOrder;
  } catch (error) {
    // A concurrent request using the same idempotency
    // key may have already committed the order.
    const committed = await Order.findOne({
      customerId,
      checkoutKey,
    });

    if (committed) return committed;

    throw error;
  } finally {
    await session.endSession();
  }
}
