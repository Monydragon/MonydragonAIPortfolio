"use client";

import { useSession } from "next-auth/react";
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

	const handleClick = () => {
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

	return (
		<motion.button
			onClick={handleClick}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-5 py-3 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
			aria-label={label}
			title={label}
		>
			<span className="text-sm font-medium">{label}</span>
		</motion.button>
	);
}


