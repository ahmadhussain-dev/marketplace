
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { requireRole } from "@/modules/auth/session";
import CheckoutForm from "@/components/checkout/checkout-form";

async function CheckoutContent() {
  await connection();

  const user = await requireRole("customer");

  if (!user || user.status !== "active") {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-8 text-3xl font-bold">
        Checkout
      </h1>

      <CheckoutForm />
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading checkout...</p>}>
      <CheckoutContent />
    </Suspense>
  );
}
