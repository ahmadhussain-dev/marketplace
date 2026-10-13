import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";

//  export const runtime = "nodejs";
//  export const dynamic = "";

export async function GET() {
  try {
    const connection = await connectDB();
    await connection.connection.db.admin().ping();
    return NextResponse.json({
      success: true,
      message: "API and Database are working",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    return NextResponse.json({
      success: false,
      message: "Database unavailable",
      database: "disconnected",
    },{
      status: 503
    }); 
  }
}