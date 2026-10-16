
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { requireRole } from "@/modules/auth/session";
import AdminOrderManager from "@/components/orders/admin-order-manager";

async function AdminOrdersContent() {
  await connection();

  const admin = await requireRole("admin");

  if (!admin || admin.status !== "active") {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-3 text-3xl font-bold">
        Marketplace Orders
      </h1>

      <p className="mb-8 text-slate-600">
        Review fulfillment progress and verify
        cash-on-delivery collections.
      </p>

      <AdminOrderManager />
    </main>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={<p className="p-8">Loading administrator orders...</p>}
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
