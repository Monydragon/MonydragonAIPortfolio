import { NextResponse } from "next/server";

// Temporary stub handler to satisfy Next.js routing.
// Replace with real admin users listing/management logic when implemented.
export async function GET() {
	return NextResponse.json(
		{ ok: false, error: "Admin users endpoint not yet implemented" },
		{ status: 501 },
	);
}


