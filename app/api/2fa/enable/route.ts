import { NextResponse } from "next/server";

// Temporary stub handler to satisfy Next.js routing.
// Replace with real 2FA enable logic when implemented.
export async function POST() {
	return NextResponse.json(
		{ ok: false, error: "2FA enable endpoint not yet implemented" },
		{ status: 501 },
	);
}


