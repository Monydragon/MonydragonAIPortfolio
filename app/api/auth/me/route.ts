import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ authenticated: false }, { status: 200 });
	}
	return NextResponse.json({
		authenticated: true,
		user: {
			id: (session.user as any).id,
			email: session.user.email,
			name: session.user.name,
			username: (session.user as any).username,
			role: (session.user as any).role,
		},
	});
}


