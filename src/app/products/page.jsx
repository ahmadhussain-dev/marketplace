
"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then(response => response.json())
      .then(data => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          search,
          page: String(page),
        });

        if (category) params.set("category", category);

        const response = await fetch(
          `/api/products?${params.toString()}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load products");
        }

        if (active) {
          setProducts(data.products);
          setPagination(data.pagination);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();

    return () => { active = false; };
  }, [search, category, page]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold">
        Explore Products
      </h1>

      <p className="mt-2 text-slate-600">
        Discover products from marketplace sellers.
      </p>

      <div className="my-8 grid gap-4 md:grid-cols-2">
        <input
          className="rounded-md border p-3"
          placeholder="Search products..."
          value={search}
          onChange={event => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />

        <select
          className="rounded-md border p-3"
          value={category}
          onChange={event => {
            setCategory(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All categories</option>
          {categories.map(item => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map(product => (
              <article
                key={product.id}
                className="overflow-hidden rounded-xl border"
              >
                {product.imageUrl ? (
                  <div classname="h-48 w-full object-contain">
                    <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                    className="object-contain"
                  />
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center bg-slate-100 text-slate-500">
                    No image
                  </div>
                )}

                <div className="space-y-2 p-5">
                  <h2 className="font-semibold">
                    {product.name}
                  </h2>

                  <p className="text-sm text-slate-600">
                    {product.categoryName || "Product"}
                  </p>

                  <p className="text-lg font-bold">
                    {product.currency}{" "}
                    {(product.priceMinor / 100).toFixed(2)}
                  </p>

                  <p className="text-sm text-slate-600">
                    Available: {product.stock}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {products.length === 0 && (
            <p className="py-12 text-center">
              No products found.
            </p>
          )}

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              className="rounded border px-4 py-2 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>

            <span>
              Page {page} of {pagination?.pages || 1}
            </span>

            <button
              className="rounded border px-4 py-2 disabled:opacity-40"
              disabled={!pagination || page >= pagination.pages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}
