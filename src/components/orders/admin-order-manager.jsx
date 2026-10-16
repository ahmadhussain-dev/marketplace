"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatMoney(amount, currency) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

export default function AdminOrderManager() {
  const [orders, setOrders] = useState([]);
  const [references, setReferences] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  async function loadOrders() {
    const response = await fetch("/api/admin/orders", {
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to load orders");
    }

    setOrders(data.orders);
  }

  useEffect(() => {
    let active = true;

    async function loadInitialOrders() {
      try {
        const response = await fetch("/api/admin/orders", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        if (active) setOrders(data.orders);
      } catch (error) {
        if (active) setMessage(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadInitialOrders();

    return () => {
      active = false;
    };
  }, []);

  async function confirmCOD(orderId) {
    const collectionReference = references[orderId]?.trim();

    if (!collectionReference || collectionReference.length < 6) {
      setMessage("Enter a valid verified collection reference.");
      return;
    }

    if (!window.confirm(
      "Have you verified the COD collection against an authorized record?"
    )) {
      return;
    }

    setBusyId(orderId);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/cod`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ collectionReference }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setMessage("COD collection confirmed.");
      await loadOrders();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="space-y-6">
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}

      {orders.length === 0 && <p>No orders found.</p>}

      {orders.map(order => {
        const canConfirm =
          order.paymentMethod === "cod" &&
          order.paymentStatus === "pending" &&
          order.status === "completed" &&
          order.fulfillmentGroups.length > 0 &&
          order.fulfillmentGroups.every(
            group => group.status === "delivered"
          );

        return (
          <article
            key={order.id}
            className="rounded-xl border p-5"
          >
            <h2 className="break-all font-semibold">
              Order: {order.id}
            </h2>

            <p className="mt-2">
              Order status: {order.status}
            </p>

            <p>
              Payment status: {order.paymentStatus}
            </p>

            <p className="font-semibold">
              Total: {formatMoney(
                order.totalMinor,
                order.currency
              )}
            </p>

            <div className="mt-3 space-y-1">
              {order.fulfillmentGroups.map(group => (
                <p key={group.id} className="text-sm">
                  Store {group.storeId}: {group.status}
                </p>
              ))}
            </div>

            {canConfirm && (
              <div className="mt-5 space-y-3 border-t pt-4">
                <Input
                  placeholder="Verified COD collection reference"
                  value={references[order.id] || ""}
                  onChange={event =>
                    setReferences(previous => ({
                      ...previous,
                      [order.id]: event.target.value,
                    }))
                  }
                />

                <Button
                  disabled={busyId === order.id}
                  onClick={() => confirmCOD(order.id)}
                >
                  {busyId === order.id
                    ? "Confirming..."
                    : "Confirm Verified COD Collection"}
                </Button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
