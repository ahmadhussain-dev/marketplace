
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { requireRole } from "@/modules/auth/session";
import CartView from "@/components/cart/cart-view";

async function CartContent() {
  await connection();

  const user = await requireRole("customer");
  if (!user || user.status !== "active") redirect("/login");

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
      <CartView />
    </main>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading cart...</p>}>
      <CartContent />
    </Suspense>
  );
}
