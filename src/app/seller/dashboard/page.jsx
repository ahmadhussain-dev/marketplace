
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { requireRole } from "@/modules/auth/session";
import LogoutButton from "@/components/auth/logout-button";

async function SellerDashboardContent() {
  // Wait for an actual request before checking auth.
  await connection();

  // Get the authenticated seller.
  const user = await requireRole("seller");

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Seller Dashboard
        </h1>

        <LogoutButton />
      </div>

      <p className="mt-6">
        Welcome, {user.name}
      </p>

      <p className="mt-2">
        Store: {user.storeName}
      </p>

      {user.status === "pending" ? (
        <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900">
          Your seller account is awaiting
          administrator approval.
        </div>
      ) : (
        <div className="mt-6 rounded-lg border p-5">
          Your seller account is approved.
          Product management will be added
          in Phase 3.
        </div>
      )}
    </main>
  );
}

export default function SellerDashboard() {
  return (
    <Suspense
      fallback={
        <main className="p-8">
          <p>Loading seller dashboard...</p>
        </main>
      }
    >
      <SellerDashboardContent />
    </Suspense>
  );
}
