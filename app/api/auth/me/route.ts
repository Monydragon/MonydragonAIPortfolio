import { auth } from "@/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET() {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ authenticated: false }, { status: 200 });
	}
	
	try {
		await connectDB();
		const user = await User.findOne({ email: session.user.email }).select('emailVerified');
		
		return NextResponse.json({
			authenticated: true,
			user: {
				id: (session.user as any).id,
				email: session.user.email,
				name: session.user.name,
				username: (session.user as any).username,
				role: (session.user as any).role,
				emailVerified: user?.emailVerified || null,
			},
		});
	} catch (error) {
		return NextResponse.json({
			authenticated: true,
			user: {
				id: (session.user as any).id,
				email: session.user.email,
				name: session.user.name,
				username: (session.user as any).username,
				role: (session.user as any).role,
				emailVerified: null,
			},
		});
	}
}


