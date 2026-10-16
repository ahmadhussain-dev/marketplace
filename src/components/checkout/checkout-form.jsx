
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fields = [
  ["fullName", "Full name"],
  ["phone", "Phone number"],
  ["line1", "Address line 1"],
  ["line2", "Address line 2 (optional)"],
  ["city", "City"],
  ["region", "State / Province"],
  ["postalCode", "Postal code"],
  ["country", "Country code (e.g. PK)"],
];

export default function CheckoutForm() {
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "PK",
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkoutKey, setCheckoutKey] = useState(null);

  useEffect(() => {
    let active = true;

    fetch("/api/addresses", { cache: "no-store" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.addresses;
      })
      .then(data => {
        if (active) {
          setAddresses(data);
          if (data.length) setSelectedId(data[0].id);
        }
      })
      .catch(error => {
        if (active) setMessage(error.message);
      });

    return () => { active = false; };
  }, []);

  async function saveAddress(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setAddresses(previous => [data.address, ...previous]);
      setSelectedId(data.address.id);
      setMessage("Shipping address saved");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function placeOrder() {
    if (!selectedId) {
      setMessage("Please save and select a shipping address");
      return;
    }

    setBusy(true);
    setMessage("");

    const key = checkoutKey || crypto.randomUUID();
    if (!checkoutKey) setCheckoutKey(key);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedId,
          checkoutKey: key,
          paymentMethod: "cod",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Checkout failed");
      }

      setMessage(`Order created successfully: ${data.order.id}`);
      window.location.href = "/customer/orders";
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Select Shipping Address
        </h2>

        {addresses.map(address => (
          <label key={address.id} className="block rounded border p-3">
            <input
              type="radio"
              name="address"
              checked={selectedId === address.id}
              onChange={() => setSelectedId(address.id)}
            />
            <span className="ml-3">
              {address.fullName} — {address.line1},
              {" "}{address.city}, {address.country}
            </span>
          </label>
        ))}
      </section>

      <form
        onSubmit={saveAddress}
        className="space-y-4 rounded-xl border p-5"
      >
        <h2 className="text-xl font-semibold">
          Add a Shipping Address
        </h2>

        {fields.map(([name, label]) => (
          <label key={name} className="block">
            <span className="mb-1 block text-sm">{label}</span>
            <Input
              value={form[name]}
              required={!["line2", "region", "postalCode"].includes(name)}
              onChange={event => setForm(previous => ({
                ...previous,
                [name]: event.target.value,
              }))}
            />
          </label>
        ))}

        <Button type="submit" disabled={busy}>
          Save Address
        </Button>
      </form>

      <section className="space-y-4 rounded-xl border p-5">
        <h2 className="text-xl font-semibold">Payment Method</h2>

        <p>Cash on Delivery — development testing</p>

        <p className="text-sm text-amber-700">
          This is a test checkout. Shipping rates and taxes
          have not been configured. Do not use it for real purchases.
        </p>

        <Button
          type="button"
          disabled={busy || !selectedId}
          onClick={placeOrder}
        >
          {busy ? "Processing..." : "Place Test Order"}
        </Button>
      </section>

      {message && <p role="status">{message}</p>}
    </div>
  );
}
