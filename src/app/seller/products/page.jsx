
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { requireRole } from "@/modules/auth/session";
import ProductManager from "@/components/seller/product-manager";

async function SellerProductsContent() {
  await connection();

  const seller = await requireRole("seller");

  if (!seller || seller.status !== "active") {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-8 text-3xl font-bold">
        Product Management
      </h1>

      <ProductManager />
    </main>
  );
}

export default function SellerProductsPage() {
  return (
    <Suspense
      fallback={<p className="p-8">Loading products...</p>}
    >
      <SellerProductsContent />
    </Suspense>
  );
}
