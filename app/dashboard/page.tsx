"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";

interface UserRoles {
	_id: string;
	name: string;
	color?: string;
}

export default function UserDashboardPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [userRoles, setUserRoles] = useState<UserRoles[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login?next=/dashboard");
		}
	}, [status, router]);

	// Fetch user roles
	useEffect(() => {
		if (status === "authenticated" && session?.user) {
			fetchUserRoles();
		}
	}, [status, session]);

	const fetchUserRoles = async () => {
		try {
			const res = await fetch("/api/users?includeRoles=true&limit=1&search=" + encodeURIComponent(session?.user?.email || ""));
			const data = await res.json();
			if (res.ok && data.users && data.users.length > 0) {
				const user = data.users[0];
				if (user.roles) {
					setUserRoles(user.roles);
				}
			}
		} catch (error) {
			console.error("Error fetching user roles:", error);
		} finally {
			setLoading(false);
		}
	};

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
		<div className="min-h-screen bg-gray-50 dark:bg-gray-950">
			<EmailVerificationBanner />
			<div className="max-w-4xl mx-auto px-6 py-12">
				<h1 className="text-3xl font-semibold mb-4">
					Welcome, {(session?.user as any)?.username || session?.user?.name || session?.user?.email}
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mb-8">
					This is your dashboard. More features coming soon.
				</p>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
						<h2 className="text-xl font-medium mb-2">Profile</h2>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Username: {(session?.user as any)?.username || "—"}
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Email: {session?.user?.email}
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Roles: {loading ? "Loading..." : userRoles.length > 0 ? (
								<span className="flex flex-wrap gap-1 mt-1">
									{userRoles.map((role) => (
										<span
											key={role._id}
											className="px-2 py-0.5 rounded text-xs font-medium"
											style={{
												backgroundColor: role.color ? `${role.color}20` : "#80808020",
												color: role.color || "#808080",
											}}
										>
											{role.name}
										</span>
									))}
								</span>
							) : "—"}
						</p>
						{userRoles.some((r) => r.name === "Administrator") && (
							<p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
								<a href="/MonyAdmin" className="underline">
									→ Access Admin Dashboard
								</a>
							</p>
						)}
					</div>
					<div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
						<h2 className="text-xl font-medium mb-2">Security</h2>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Manage 2FA and account security in settings.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}


