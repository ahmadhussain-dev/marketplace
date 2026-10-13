import { NextResponse } from "next/server";
import { rejectCrossOrigin } from "@/lib/auth/origin";
import { destroySession } from "@/modules/auth/session";
// export const runtime = "nodejs";

export async function POST(request) {
  const rejected = rejectCrossOrigin(request);
  if(rejected) return rejected;
  
  await destroySession();
  return NextResponse.json({
    success: true,
    message: "Log out successfully",
  });
}

