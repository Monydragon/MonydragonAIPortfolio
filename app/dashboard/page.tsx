"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserDashboardPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login?next=/dashboard");
		}
	}, [status, router]);

	if (status === "loading") {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
					<p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	if (status !== "authenticated") {
		return null;
	}

	return (
		<div className="max-w-4xl mx-auto px-6 py-12">
			<h1 className="text-3xl font-semibold mb-4">Welcome, {(session?.user as any)?.username || session?.user?.name || session?.user?.email}</h1>
			<p className="text-gray-600 dark:text-gray-400 mb-8">
				This is your dashboard. More features coming soon.
			</p>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
					<h2 className="text-xl font-medium mb-2">Profile</h2>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Username: {(session?.user as any)?.username || "—"}
					</p>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Email: {session?.user?.email}
					</p>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Role: {(session?.user as any)?.role}
					</p>
				</div>
				<div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
					<h2 className="text-xl font-medium mb-2">Security</h2>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Manage 2FA in settings (coming soon).
					</p>
				</div>
			</div>
		</div>
	);
}


