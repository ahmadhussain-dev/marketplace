"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";

function formatMoney(amount, currency) {
  if(!currency || amount === null ) return "Mixed currencies";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
  }).format(amount/100);
  
}

export default function CartView() {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/cart", { cache: "no-store"}).then(async response => {
      const data = await response.json();
      if(!response.ok) throw new Error(data.message);
      return  data.cart;
    }).then(data => {
      if (active) setCart(data);
    })
    .catch(error => {if(active) setError(error.message);}
  );

  return () => {active = false;
  };
  }, []);

 async function changeQuantity(productId, quantity) {
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setCart(data.cart);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  if (!cart && !error) return <p>Loading cart...</p>;

  return (
    <div className="space-y-6">
      {error && <p role="alert" className="text-red-600">{error}</p>}

      {cart?.items.length === 0 && (
        <p>Your shopping cart is empty.</p>
      )}

      {cart?.items.map(item => (
        <div
          key={item.productId}
          className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"
        >
          <div>
            <h2 className="font-semibold">{item.name}</h2>
            <p className="text-sm text-slate-600">
              {formatMoney(item.priceMinor, item.currency)}
            </p>
            {!item.available && (
              <p className="text-sm text-red-600">
                Product unavailable or insufficient stock
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              disabled={busy || item.quantity <= 1}
              onClick={() => changeQuantity(
                item.productId, item.quantity - 1
              )}
            >
              −
            </Button>

            <span>{item.quantity}</span>

            <Button
              variant="outline"
              disabled={busy || item.quantity >= 99}
              onClick={() => changeQuantity(
                item.productId, item.quantity + 1
              )}
            >
              +
            </Button>

            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => changeQuantity(item.productId, 0)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}

      {cart && cart.items.length > 0 && (
        <div className="rounded-lg border p-5">
          <p className="text-xl font-semibold">
            Subtotal: {formatMoney(
              cart.subtotalMinor, cart.currency
            )}
          </p>

          <p className="my-3 text-sm text-slate-500">
            Final shipping and taxes are not yet calculated.
          </p>

          {cart.currency &&
           cart.items.every(item => item.available) && (
            <Button>
              <Link href="/checkout">Continue to Checkout</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}