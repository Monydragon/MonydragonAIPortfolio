"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function FloatingAuthButton() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [hasAdminAccess, setHasAdminAccess] = useState(false);
	const [loading, setLoading] = useState(true);

	// Check if user has admin access by fetching their roles
	useEffect(() => {
		if (status === "authenticated" && session?.user?.email) {
			fetch(`/api/users?includeRoles=true&limit=1&search=${encodeURIComponent(session.user.email)}`)
				.then(res => res.json())
				.then(data => {
					if (data.users && data.users.length > 0) {
						const user = data.users[0];
						// Check if user has Administrator role or admin.access permission
						const hasAdminRole = user.roles?.some((r: any) => r.name === 'Administrator');
						const hasAdminPermission = user.permissions?.includes('admin.access');
						setHasAdminAccess(hasAdminRole || hasAdminPermission);
					}
				})
				.catch(() => {
					setHasAdminAccess(false);
				})
				.finally(() => {
					setLoading(false);
				});
		} else {
			setLoading(false);
		}
	}, [status, session]);

	const handleDashboardClick = () => {
		if (status !== "authenticated") {
			router.push("/login");
			return;
		}
		router.push("/dashboard");
	};

	const handleAdminClick = () => {
		if (status !== "authenticated") {
			router.push("/login?next=/MonyAdmin");
			return;
		}
		router.push("/MonyAdmin");
	};

	const handleSignOut = () => {
		signOut({ callbackUrl: "/" });
	};

	const isAuthed = status === "authenticated";

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
		>
			{isAuthed && (
				<>
					<button
						onClick={handleDashboardClick}
						className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-5 py-3 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
						aria-label="My Dashboard"
						title="My Dashboard"
					>
						<span className="text-sm font-medium">My Dashboard</span>
					</button>
					{!loading && hasAdminAccess && (
						<button
							onClick={handleAdminClick}
							className="inline-flex items-center gap-2 rounded-full bg-red-600 text-white px-5 py-3 shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
							aria-label="Admin Dashboard"
							title="Admin Dashboard"
						>
							<span className="text-sm font-medium">Admin Dashboard</span>
						</button>
					)}
				</>
			)}
			{!isAuthed && (
				<button
					onClick={() => router.push("/login")}
					className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-5 py-3 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
					aria-label="Sign in"
					title="Sign in"
				>
					<span className="text-sm font-medium">Sign in</span>
				</button>
			)}
			{isAuthed && (
				<button
					onClick={handleSignOut}
					className="inline-flex items-center justify-center rounded-full bg-gray-900 text-white w-10 h-10 shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
					aria-label="Sign out"
					title="Sign out"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						strokeLinecap="round"
						strokeLinejoin="round"
						className="w-4 h-4"
					>
						<path d="M3 3h8v4" />
						<path d="M11 17v4H3V3" />
						<path d="M15 12H9" />
						<path d="M18 9l3 3-3 3" />
					</svg>
				</button>
			)}
		</motion.div>
	);
}

