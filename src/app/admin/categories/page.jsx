
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { requireRole } from "@/modules/auth/session";
import CategoryForm from "@/components/admin/category-form";

async function AdminCategoryContent() {
  await connection();

  const user = await requireRole("admin");

  if (!user || user.status !== "active") {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Manage Product Categories
      </h1>

      <CategoryForm />
    </main>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <AdminCategoryContent />
    </Suspense>
  );
}
