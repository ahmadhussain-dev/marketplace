
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { requireRole } from "@/modules/auth/session";
import StoreForm from "@/components/seller/store-form";

async function StorePageContent() {
  await connection();

  const user = await requireRole("seller");

  if (!user) redirect("/login");

  if (user.status !== "active") {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">
          Seller Approval Required
        </h1>
        <p>Your account must be approved before creating a store.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Create Your Store
      </h1>

      <StoreForm />
    </main>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<p className="p-8">Loading store...</p>}>
      <StorePageContent />
    </Suspense>
  );
}
