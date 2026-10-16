
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import SellerOrderActions from "@/components/orders/seller-order-actions";
import { requireRole } from "@/modules/auth/session";
import { findStoreByOwner } from "@/modules/stores/store.repository";
import { connectDB } from "@/lib/db/mongoose";
import { Order } from "@/modules/orders/order.model";

async function SellerOrdersContent() {
  await connection();

  const seller = await requireRole("seller");

  if (!seller || seller.status !== "active") {
    redirect("/login");
  }

  const store = await findStoreByOwner(seller._id);

  if (!store || store.status !== "active") {
    return <main className="p-8">No active store found.</main>;
  }

  await connectDB();

  const orders = await Order.find({
    "fulfillmentGroups.storeId": store._id,
  }).sort({ createdAt: -1 }).limit(50).lean();

  const groups = orders.flatMap(order =>
    order.fulfillmentGroups
      .filter(group => group.storeId.equals(store._id))
      .map(group => ({
        orderId: order._id.toString(),
        id: group._id.toString(),
        currency: order.currency,
        ...group,
      }))
  );

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-8 text-3xl font-bold">
        Seller Orders
      </h1>

      {groups.length === 0 && <p>No orders received yet.</p>}

      <div className="space-y-4">
        {groups.map(group => (
          <article key={group.id} className="rounded-lg border p-5">
            <h2 className="font-semibold">
              Order {group.orderId}
            </h2>

            <p>Fulfillment status: {group.status}</p>
            <p>
              Subtotal: {group.currency}{" "}
              {(group.subtotalMinor / 100).toFixed(2)}
            </p>

            {group.items.map(item => (
              <p key={item.productId.toString()} className="text-sm">
                {item.name} × {item.quantity}
              </p>
            ))}
            <SellerOrderActions
  orderId={group.orderId}
  status={group.status}
/>
          </article>
        ))}
      </div>
    </main>
  );
}

export default function SellerOrdersPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading seller orders...</p>}>
      <SellerOrdersContent />
    </Suspense>
  );
}
