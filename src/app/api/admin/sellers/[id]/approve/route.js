
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { requireRole } from "@/modules/auth/session";
import { rejectCrossOrigin } from "@/lib/auth/origin";
import { approveSellerById } from "@/modules/users/user.repository";

// export const runtime = "nodejs";

export async function POST(request, { params }) {
  const rejected = rejectCrossOrigin(request);
  if (rejected) return rejected;

  const admin = await requireRole("admin");

  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 }
    );
  }

  const { id } = await params;

  if (!mongoose.isObjectIdOrHexString(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid seller ID" },
      { status: 400 }
    );
  }

  const seller = await approveSellerById(id);

  if (!seller) {
    return NextResponse.json(
      {
        success: false,
        message: "Pending seller not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Seller approved successfully",
    seller: {
      id: seller._id.toString(),
      name: seller.name,
      status: seller.status,
    },
  });
}
