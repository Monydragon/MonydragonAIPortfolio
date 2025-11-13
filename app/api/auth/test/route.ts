import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    message: "Auth API is accessible",
    timestamp: new Date().toISOString()
  });
}

