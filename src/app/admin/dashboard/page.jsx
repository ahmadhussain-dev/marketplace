
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/modules/auth/session";
import LogoutButton from "@/components/auth/logout-button";

async function AdminDashboardContent() {
  // Render authentication at request time.
  await connection();

  // Verify the administrator's session and role.
  const user = await requireRole("admin");

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Administrator Dashboard
        </h1>

        <LogoutButton />
      </div>

      <p className="mt-6">
        Welcome, {user.name}
      </p>

      <div className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">
          Marketplace Administration
        </h2>

        <p className="mt-2 text-slate-600">
          Manage seller approvals, users,
          and marketplace operations here.
        </p>
        <Link
  href="/admin/orders"
  className="mt-6 inline-block rounded-md bg-slate-900 px-5 py-3 text-white"
>
  Manage Orders
</Link>
      </div>

    </main>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense
      fallback={
        <main className="p-8">
          <p>Loading administrator dashboard...</p>
        </main>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
