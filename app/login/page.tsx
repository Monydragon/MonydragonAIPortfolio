 "use client";

import React, { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { signIn as nextAuthSignIn } from "next-auth/react";

function LoginPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [totp, setTotp] = useState("");
	const [error, setError] = useState("");
	const [requires2FA, setRequires2FA] = useState(false);
	const [loading, setLoading] = useState(false);
	const [oauthLoading, setOauthLoading] = useState(false);

	const doSignIn = async (withTotp: boolean) => {
		setError("");
		setLoading(true);
		try {
			const result = await signIn("credentials", {
				identifier,
				password,
				totp: withTotp ? totp : undefined,
				redirect: false,
			});

			if (result?.error) {
				if (result.error === "2FA_REQUIRED") {
					setRequires2FA(true);
					setError("Enter your 2FA code to continue.");
					return;
				}
				if (result.error === "CredentialsSignin") {
					setError("Invalid credentials. Please try again.");
					return;
				}
				setError(result.error);
				return;
			}

			// On success, route by optional next param or role
			const next = searchParams.get("next");
			if (next && next.startsWith("/")) {
				router.push(next);
				router.refresh();
				return;
			}
			// Fetch role to decide destination
			try {
				const res = await fetch("/api/auth/me", { cache: "no-store" });
				if (res.ok) {
					const data = await res.json();
					const role = data?.user?.role;
					if (role === "admin") {
						router.push("/MonyAdmin");
					} else {
						router.push("/dashboard");
					}
					router.refresh();
					return;
				}
			} catch {}
			router.push("/dashboard");
			router.refresh();
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setOauthLoading(true);
		try {
			await nextAuthSignIn("google", {
				callbackUrl: searchParams.get("next") || "/dashboard",
			});
		} finally {
			setOauthLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await doSignIn(requires2FA);
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-gray-900">
			<motion.div
				className="w-full max-w-md"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800 space-y-6">
					<div className="text-center">
						<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
							Sign in
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Use your email or username.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						{error && (
							<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
								{error}
							</div>
						)}

						<div>
							<label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Email or Username
							</label>
							<input
								id="identifier"
								type="text"
								value={identifier}
								onChange={(e) => setIdentifier(e.target.value)}
								required
								className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="e.g. jane@doe.com or janedoe"
							/>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="••••••••"
							/>
						</div>

						{requires2FA && (
							<div>
								<label htmlFor="totp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									2FA Code
								</label>
								<input
									id="totp"
									type="text"
									inputMode="numeric"
									pattern="[0-9]*"
									value={totp}
									onChange={(e) => setTotp(e.target.value)}
									required
									className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="123456"
								/>
							</div>
						)}

						<AnimatedButton
							type="submit"
							variant="primary"
							disabled={loading}
							className="w-full"
						>
							{loading ? "Signing in..." : requires2FA ? "Verify 2FA & Sign In" : "Sign In"}
						</AnimatedButton>

						<div className="relative my-2">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t border-gray-200 dark:border-gray-800" />
							</div>
							<div className="relative flex justify-center text-xs">
								<span className="px-2 bg-white dark:bg-gray-900 text-gray-500">or</span>
							</div>
						</div>

						<button
							type="button"
							onClick={handleGoogleSignIn}
							disabled={oauthLoading}
							className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900"
						>
							<span>Continue with Google</span>
						</button>
					</form>
				</div>
			</motion.div>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
			<LoginPageContent />
		</Suspense>
	);
}

