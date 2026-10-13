
import { NextResponse } from "next/server";
import { requireRole } from "@/modules/auth/session";
import { findPendingSellers } from "@/modules/users/user.repository";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireRole("admin");

  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 }
    );
  }

  const sellers = await findPendingSellers();

  const response = NextResponse.json({
    success: true,
    sellers: sellers.map((seller) => ({
      id: seller._id.toString(),
      name: seller.name,
      email: seller.email,
      storeName: seller.storeName,
      status: seller.status,
      createdAt: seller.createdAt,
    })),
  });

  response.headers.set("Cache-Control", "no-store");

  return response;
}
