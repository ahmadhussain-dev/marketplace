
"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
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

async function addToCart(productId) {
  try {
    // Read the existing quantity first.
    const cartResponse = await fetch("/api/cart");
    if (cartResponse.status === 401) {
      window.redirect("/login");
      return;
    }

    const cartData = await cartResponse.json();

    if (!cartResponse.ok) {
      throw new Error(cartData.message || "Unable to load cart");
    }

    const existing = cartData.cart.items.find(
      item => item.productId === productId
    );

    const response = await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        quantity: (existing?.quantity || 0) + 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to add product");
    }

    alert("Product added to cart");
  } catch (error) {
    alert(error.message);
  }
}


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
    {/* Cart navigation */}
    <div className="mb-6 flex justify-end">
      <Link
        href="/cart"
        className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
      >
        View Shopping Cart
      </Link>
    </div>

    {/* Product grid */}
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <article
          key={product.id}
          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          {/* Product image */}
          <div className="relative h-56 w-full overflow-hidden bg-slate-50">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                No image available
              </div>
            )}
          </div>

          {/* Product details */}
          <div className="flex flex-1 flex-col p-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              {product.categoryName || "Uncategorized"}
            </p>

            <h2 className="mb-3 line-clamp-2 min-h-12 text-lg font-semibold leading-6 text-slate-900">
              {product.name}
            </h2>

            <p className="mb-3 text-xl font-bold text-slate-900">
              {new Intl.NumberFormat("en", {
                style: "currency",
                currency: product.currency,
              }).format(product.priceMinor / 100)}
            </p>

            <p className="mb-5 text-sm text-slate-500">
              {product.stock > 0
                ? `${product.stock} available`
                : "Out of stock"}
            </p>

            {/* Bottom-aligned button */}
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => addToCart(product.id)}
              className="mt-auto w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {product.stock > 0
                ? "Add to Cart"
                : "Out of Stock"}
            </button>
          </div>
        </article>
      ))}
    </div>

    {/* Empty state */}
    {products.length === 0 && (
      <div className="py-16 text-center">
        <p className="text-lg font-medium text-slate-700">
          No products found
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Try a different search or category.
        </p>
      </div>
    )}

    {/* Pagination */}
    {products.length > 0 && (
      <div className="mt-10 flex items-center justify-center gap-4">
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>

        <span className="text-sm text-slate-600">
          Page {page} of {pagination?.pages || 1}
        </span>

        <button
          type="button"
          className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={
            !pagination || page >= pagination.pages
          }
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    )}
  </>
)}

    </main>
  );
}
