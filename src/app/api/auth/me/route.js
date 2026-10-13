
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    success: true,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });

  response.headers.set("Cache-Control", "no-store");
  return response;
}
