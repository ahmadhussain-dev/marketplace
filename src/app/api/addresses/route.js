import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/db/mongoose";
import { requireRole } from "@/modules/auth/session";
import { rejectCrossOrigin } from "@/lib/auth/origin";
import { Address } from "@/modules/addresses/address.model";

const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(25),
  line1: z.string().trim().min(5).max(200),
  line2: z.string().trim().max(200).default(""),
  city: z.string().trim().min(2).max(100),
  region: z.string().trim().max(100).default(""),
  postalCode: z.string().trim().max(20).default(""),
  country: z.string().regex(/^[a-zA-Z]{2}$/)
    .transform(value => value.toUpperCase()),
});

async function getCustomer() {
  const user = await requireRole("customer");
  return user?.status === "active" ? user : null;
}

function serialize(address) {
  return {
    id: address._id.toString(),
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    region: address.region,
    postalCode: address.postalCode,
    country: address.country,
  };
}

export async function GET() {
  const customer = await getCustomer();
  if (!customer) {
    return NextResponse.json(
      { message: "Unauthorized" }, { status: 401 }
    );
  }

  await connectDB();

  const addresses = await Address.find({
    customerId: customer._id,
  }).sort({ createdAt: -1 }).lean();

  return NextResponse.json(
    { success: true, addresses: addresses.map(serialize) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request) {
  const rejected = rejectCrossOrigin(request);
  if (rejected) return rejected;

  const customer = await getCustomer();
  if (!customer) {
    return NextResponse.json(
      { message: "Unauthorized" }, { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = addressSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid address details" }, { status: 400 }
    );
  }

  await connectDB();

  const count = await Address.countDocuments({
    customerId: customer._id,
  });

  if (count >= 10) {
    return NextResponse.json(
      { message: "Address limit reached" }, { status: 400 }
    );
  }

  const address = await Address.create({
    customerId: customer._id,
    ...parsed.data,
  });

  return NextResponse.json(
    { success: true, address: serialize(address) },
    { status: 201 }
  );
}