
"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emptyForm = {
  name: "",
  description: "",
  categoryId: "",
  sku: "",
  price: "",
  currency: "USD",
  stock: "0",
  imageUrl: "",
  status: "draft",
};

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadData() {
    try {
      const [productResponse, categoryResponse] =
        await Promise.all([
          fetch("/api/seller/products", { cache: "no-store" }),
          fetch("/api/categories"),
        ]);

      const productData = await productResponse.json();
      const categoryData = await categoryResponse.json();

      if (!productResponse.ok || !categoryResponse.ok) {
        throw new Error(
          productData.message || categoryData.message ||
          "Unable to load products"
        );
      }

      setProducts(productData.products || []);
      setCategories(categoryData.categories || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  
useEffect(() => {
  let cancelled = false;

  async function fetchInitialData() {
    try {
      const [productResponse, categoryResponse] =
        await Promise.all([
          fetch("/api/seller/products", {
            cache: "no-store",
          }),
          fetch("/api/categories"),
        ]);

      const [productData, categoryData] =
        await Promise.all([
          productResponse.json(),
          categoryResponse.json(),
        ]);

      if (!productResponse.ok || !categoryResponse.ok) {
        throw new Error(
          productData.message ||
          categoryData.message ||
          "Unable to load products"
        );
      }

      if (!cancelled) {
        setProducts(productData.products || []);
        setCategories(categoryData.categories || []);
      }
    } catch (error) {
      if (!cancelled) {
        setMessage(error.message);
      }
    }
  }

  fetchInitialData();

  return () => {
    cancelled = true;
  };
}, []);


  function updateField(name, value) {
    setForm(previous => ({
      ...previous,
      [name]: value,
    }));
  }

  async function saveProduct(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const amount = Number(form.price);
    const stock = Number(form.stock);

    if (!Number.isFinite(amount) ||
        amount < 0 ||
        !/^\d+(\.\d{1,2})?$/.test(form.price)) {
      setMessage("Enter a valid price with up to 2 decimal places.");
      setLoading(false);
      return;
    }

    if (!Number.isSafeInteger(stock) || stock < 0) {
      setMessage("Stock must be a non-negative whole number.");
      setLoading(false);
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      categoryId: form.categoryId,
      sku: form.sku,
      priceMinor: Math.round(amount * 100),
      currency: form.currency,
      stock,
      imageUrl: form.imageUrl,
      status: form.status,
    };

    const url = editingId
      ? `/api/seller/products/${editingId}`
      : "/api/seller/products";

    try {
      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setMessage(
        editingId ? "Product updated!" : "Product created!"
      );

      setEditingId(null);
      setForm(emptyForm);
      await loadData();
    } catch (error) {
      setMessage(error.message || "Unable to save product");
    } finally {
      setLoading(false);
    }
  }

  function edit(product) {
    setEditingId(product.id);

    setForm({
      name: product.name,
      description: product.description || "",
      categoryId: product.categoryId,
      sku: product.sku,
      price: (product.priceMinor / 100).toFixed(2),
      currency: product.currency,
      stock: String(product.stock),
      imageUrl: product.imageUrl || "",
      status: product.status,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(id) {
    if (!window.confirm("Remove this product?")) return;

    try {
      const response = await fetch(
        `/api/seller/products/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Unable to remove product");
      }

      setMessage("Product removed");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="space-y-10">
      <form
        onSubmit={saveProduct}
        className="max-w-xl space-y-4 rounded-xl border p-6"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Product" : "Add New Product"}
        </h2>

        <label className="block">
          Product name
          <Input
            value={form.name}
            onChange={e => updateField("name", e.target.value)}
            required
            minLength={2}
          />
        </label>

        <label className="block">
          Description
          <textarea
            className="w-full rounded-md border p-3"
            value={form.description}
            onChange={e => updateField("description", e.target.value)}
            maxLength={3000}
            rows={3}
          />
        </label>

        <label className="block">
          Category
          <select
            className="w-full rounded-md border p-3"
            value={form.categoryId}
            onChange={e => updateField("categoryId", e.target.value)}
            required
          >
            <option value="">Select category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          SKU
          <Input
            value={form.sku}
            onChange={e => updateField("sku", e.target.value)}
            placeholder="SKU-001"
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label>
            Price
            <Input
              value={form.price}
              onChange={e => updateField("price", e.target.value)}
              placeholder="25.99"
              inputMode="decimal"
              required
            />
          </label>

          <label>
            Currency
            <select
              className="w-full rounded-md border p-2"
              value={form.currency}
              onChange={e => updateField("currency", e.target.value)}
            >
              {["USD", "PKR", "EUR", "GBP"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          Available stock
          <Input
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={e => updateField("stock", e.target.value)}
            required
          />
        </label>

        <label className="block">
          Image URL (HTTPS, optional)
          <Input
            value={form.imageUrl}
            onChange={e => updateField("imageUrl", e.target.value)}
            placeholder="https://example.com/product.jpg"
          />
        </label>

        <label className="block">
          Product status
          <select
            className="w-full rounded-md border p-3"
            value={form.status}
            onChange={e => updateField("status", e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Product"}
          </Button>

          {editingId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel Edit
            </Button>
          )}
        </div>

        <p role="status">{message}</p>
      </form>

      <section>
        <h2 className="mb-4 text-2xl font-bold">
          Your Products ({products.length})
        </h2>

        <div className="space-y-3">
          {products.map(product => (
            <div
              key={product.id}
              className="rounded-lg border p-4"
            >
              <div className="flex flex-wrap items-center
                              justify-between gap-3">
                <div>
                  <h3 className="font-semibold">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {product.currency}{" "}
                    {(product.priceMinor / 100).toFixed(2)}
                    {" · "}Stock: {product.stock}
                    {" · "}{product.status}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => edit(product)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => deleteProduct(product.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
