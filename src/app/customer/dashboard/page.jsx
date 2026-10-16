
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/modules/auth/session";
import LogoutButton from "@/components/auth/logout-button";

async function CustomerDashboardContent() {
  // Wait for an actual incoming request.
  await connection();

  // Check authentication at request time.
  const user = await requireRole("customer");

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Customer Dashboard
        </h1>

        <LogoutButton />
      </div>

      <p className="mt-6">
        Welcome, {user.name}
      </p>

      <p className="text-slate-600">
        Email: {user.email}
      </p>

      <div className="mt-8 flex gap-4">
  <Link href="/products" className="underline">
    Browse Products
  </Link>

  <Link href="/cart" className="underline">
    My Cart
  </Link>

  <Link href="/customer/orders" className="underline">
    My Orders
  </Link>
</div>
    </main>
  );
}

export default function CustomerDashboard() {
  return (
    <Suspense
      fallback={
        <main className="p-8">
          <p>Loading customer dashboard...</p>
        </main>
      }
    >
      <CustomerDashboardContent />
    </Suspense>
  );
}
