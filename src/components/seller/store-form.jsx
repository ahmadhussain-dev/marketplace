
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StoreForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const payload = {
      name: form.get("name"),
      description: form.get("description"),
      country: form.get("country"),
    };

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/seller/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setMessage("Store registered successfully!");
    } catch (error) {
      setMessage(error.message || "Unable to create store");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-lg space-y-4">
      <div>
        <label htmlFor="name">Store name</label>
        <Input id="name" name="name" required maxLength={120} />
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          maxLength={1000}
          className="w-full rounded-md border p-3"
          rows={4}
          placeholder="Tell customers about your store..."
        />
      </div>

      <div>
        <label htmlFor="country">Country</label>
        <select
          id="country"
          name="country"
          className="w-full rounded-md border p-3"
          required
        >
          <option value="PK">Pakistan</option>
          <option value="US">United States</option>
          <option value="GB">United Kingdom</option>
          <option value="AE">United Arab Emirates</option>
          <option value="CA">Canada</option>
        </select>
      </div>

      <Button disabled={loading} type="submit">
        {loading ? "Creating..." : "Create Store"}
      </Button>

      <p role="status">{message}</p>
    </form>
  );
}
