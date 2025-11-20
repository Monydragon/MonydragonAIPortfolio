import { NextResponse } from "next/server";

// Temporary stub handler to satisfy Next.js routing.
// Replace with real admin user role update logic when implemented.
export async function POST() {
	return NextResponse.json(
		{ ok: false, error: "Admin user role endpoint not yet implemented" },
		{ status: 501 },
	);
}


