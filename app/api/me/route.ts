import { NextResponse } from "next/server";

// Temporary stub handler to satisfy Next.js routing.
// Replace with real "current user" logic when implemented.
export async function GET() {
	return NextResponse.json(
		{ ok: false, error: "Current user endpoint not yet implemented" },
		{ status: 501 },
	);
}


