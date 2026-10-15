
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CategoryForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setName("");
      setMessage(`Created category: ${data.category.name}`);
    } catch (error) {
      setMessage(error.message || "Unable to create category");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <label htmlFor="category">Category name</label>

      <Input
        id="category"
        value={name}
        onChange={event => setName(event.target.value)}
        placeholder="Electronics"
        minLength={2}
        maxLength={80}
        required
      />

      <Button disabled={loading} type="submit">
        {loading ? "Saving..." : "Create Category"}
      </Button>

      <p role="status">{message}</p>
    </form>
  );
}
