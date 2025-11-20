"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminAppsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/MonyAdmin/login");
		}
		if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
			router.push("/");
		}
	}, [status, router, session]);

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

	return (
		<div className="max-w-6xl mx-auto px-6 py-10">
			<h1 className="text-3xl font-semibold mb-6">Apps</h1>
			<p className="text-gray-600 dark:text-gray-400 mb-8">
				Manage multiple apps from a single admin. This is a scaffold; plug in your apps below.
			</p>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Link href="/MonyAdmin/apps/portfolio" className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:bg-gray-50 dark:hover:bg-gray-900">
					<h2 className="text-xl font-medium mb-2">Portfolio</h2>
					<p className="text-sm text-gray-600 dark:text-gray-400">Manage portfolio content and settings.</p>
				</Link>
				<Link href="/MonyAdmin/apps/app-builder" className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:bg-gray-50 dark:hover:bg-gray-900">
					<h2 className="text-xl font-medium mb-2">App Builder</h2>
					<p className="text-sm text-gray-600 dark:text-gray-400">Manage generated apps and deployments.</p>
				</Link>
				<Link href="/MonyAdmin/apps/ai" className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:bg-gray-50 dark:hover:bg-gray-900">
					<h2 className="text-xl font-medium mb-2">AI Tools</h2>
					<p className="text-sm text-gray-600 dark:text-gray-400">Configure LLM providers and tools.</p>
				</Link>
			</div>
		</div>
	);
}


