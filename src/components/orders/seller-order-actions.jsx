"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const transitions = {
  pending: { next: "processing", label: "Start Processing" },
  processing: { next: "shipped", label: "Mark Shipped" },
  shipped: { next: "delivered", label: "Mark Delivered" },
};

export default function SellerOrderActions({
  orderId,
  status,
}) {
  const router = useRouter();

  const [carrierName, setCarrierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const action = transitions[status];

  if (!action) {
    return (
      <p className="mt-3 text-sm text-slate-500">
        No further fulfillment actions.
      </p>
    );
  }

  async function updateStatus() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/seller/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: action.next,
            carrierName,
            trackingNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Status update failed"
        );
      }

      setMessage(`Order updated to ${action.next}`);
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      {action.next === "shipped" && (
        <>
          <Input
            placeholder="Courier name"
            value={carrierName}
            onChange={event =>
              setCarrierName(event.target.value)
            }
            maxLength={100}
          />

          <Input
            placeholder="Tracking number"
            value={trackingNumber}
            onChange={event =>
              setTrackingNumber(event.target.value)
            }
            maxLength={100}
          />
        </>
      )}

      <Button
        type="button"
        onClick={updateStatus}
        disabled={
          loading ||
          (action.next === "shipped" &&
           (!carrierName.trim() || !trackingNumber.trim()))
        }
      >
        {loading ? "Updating..." : action.label}
      </Button>

      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </div>
  );
}
