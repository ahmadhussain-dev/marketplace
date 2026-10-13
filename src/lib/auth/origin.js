import "server-only";
import { NextResponse } from "next/server";

export function rejectCrossOrigin(request) {
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;

  if(!origin || origin !== expectedOrigin) {
    return NextResponse.json(
      {
        success: false,
        message: "Request origin is not allowed",
      },
      {
        status: 403
      }
    );
  }
  return null;
}