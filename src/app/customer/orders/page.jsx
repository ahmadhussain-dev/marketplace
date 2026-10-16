
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { requireRole } from "@/modules/auth/session";
import { connectDB } from "@/lib/db/mongoose";
import { Order } from "@/modules/orders/order.model";

async function CustomerOrdersContent() {
  await connection();

  const user = await requireRole("customer");
  if (!user || user.status !== "active") redirect("/login");

  await connectDB();

  const orders = await Order.find({
    customerId: user._id,
  }).sort({ createdAt: -1 }).limit(50).lean();

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-8 text-3xl font-bold">My Orders</h1>

      {orders.length === 0 && <p>No orders yet.</p>}

      <div className="space-y-5">
        {orders.map(order => (
          <article key={order._id.toString()}
            className="rounded-lg border p-5">
            <h2 className="font-semibold">
              Order {order._id.toString()}
            </h2>

            <p>Status: {order.status}</p>
            <p>Payment: {order.paymentStatus}</p>
            <p className="font-semibold">
              Total: {order.currency}{" "}
              {(order.totalMinor / 100).toFixed(2)}
            </p>

            <div className="mt-3">
              {order.fulfillmentGroups.flatMap(group =>
                group.items.map(item => (
                  <p
                    key={`${group.storeId}-${item.productId}`}
                    className="text-sm"
                  >
                    {item.name} × {item.quantity}
                  </p>
                ))
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export default function CustomerOrdersPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading orders...</p>}>
      <CustomerOrdersContent />
    </Suspense>
  );
}
