
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireRole } from "@/modules/auth/session";
import { rejectCrossOrigin } from "@/lib/auth/origin";

import { findStoreByOwner } from "@/modules/stores/store.repository";
import { registerStore } from "@/modules/stores/store.service";




const storeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).default(""),
  country: z.string().trim().regex(/^[A-Za-z]{2}$/)
    .transform(value => value.toUpperCase()),
});

function serializeStore(store) {
  return {
    id: store._id.toString(),
    name: store.name,
    description: store.description,
    country: store.country,
    status: store.status,
  };
}

export async function GET() {
  const seller = await requireRole("seller");

  if (!seller) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const store = await findStoreByOwner(seller._id);

  const response = NextResponse.json({
    success: true,
    store: store ? serializeStore(store) : null,
  });

  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function POST(request) {
  const rejected = rejectCrossOrigin(request);
  if (rejected) return rejected;

  const seller = await requireRole("seller");

  if (!seller || seller.status !== "active") {
    return NextResponse.json(
      { message: "Approved seller account required" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = storeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid store data" },
      { status: 400 }
    );
  }

  try {
    const store = await registerStore(
      seller,
      parsed.data
    );

    return NextResponse.json(
      {
        success: true,
        store: serializeStore(store),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.message === "STORE_ALREADY_EXISTS") {
      return NextResponse.json(
        { message: "Store already exists" },
        { status: 409 }
      );
    }

    console.error("Store registration failed:", error);

    return NextResponse.json(
      { message: "Unable to register store" },
      { status: 500 }
    );
  }
}
