
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterForm({ role }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);

    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      role,
    };

    if (role === "seller") {
      payload.storeName = form.get("storeName");
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      router.push("/login");
    } catch {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">Full name</label>
        <Input
          id="name"
          name="name"
          minLength={2}
          maxLength={100}
          required
        />
      </div>

      <div>
        <label htmlFor="email">Email address</label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      {role === "seller" && (
        <div>
          <label htmlFor="storeName">Store name</label>
          <Input
            id="storeName"
            name="storeName"
            minLength={2}
            maxLength={120}
            required
          />
        </div>
      )}

      <div>
        <label htmlFor="password">Password</label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={72}
          required
        />
        <p className="mt-1 text-xs text-slate-500">
          Use at least 12 characters.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? "Creating account..." : "Register"}
      </Button>
    </form>
  );
}
