"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { motion } from "framer-motion";

export default function FloatingAuthButton() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const label = useMemo(() => {
		if (status === "loading") return "Loading...";
		if (status === "authenticated") {
			const role = (session?.user as any)?.role;
			return role === "admin" ? "Admin Dashboard" : "My Dashboard";
		}
		return "Sign in";
	}, [status, session]);

	const handleDashboardClick = () => {
		if (status !== "authenticated") {
			router.push("/login");
			return;
		}
		const role = (session?.user as any)?.role;
		if (role === "admin") {
			router.push("/MonyAdmin");
		} else {
			router.push("/dashboard");
		}
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
			<button
				onClick={handleDashboardClick}
				className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-5 py-3 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
				aria-label={label}
				title={label}
			>
				<span className="text-sm font-medium">{label}</span>
			</button>
			{isAuthed && (
				<button
					onClick={handleSignOut}
					className="inline-flex items-center justify-center rounded-full bg-gray-900 text-white w-10 h-10 shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400"
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

