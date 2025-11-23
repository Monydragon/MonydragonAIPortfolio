"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

type RegistrationMode = "open" | "closed" | "invite-only" | "loading";

export default function RegisterPage() {
	const router = useRouter();
	const [registrationMode, setRegistrationMode] = useState<RegistrationMode>("loading");
	const [inviteCode, setInviteCode] = useState("");
	const [firstName, setFirstName] = useState("");
	const [middleName, setMiddleName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [phone, setPhone] = useState("");
	const [location, setLocation] = useState("");
	const [demographics, setDemographics] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch("/api/site-config");
				const data = await res.json();
				if (!cancelled) {
					const mode = (data.registrationMode as RegistrationMode) || "open";
					setRegistrationMode(mode);
				}
			} catch {
				if (!cancelled) {
					setRegistrationMode("open");
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);
		try {
			const res = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					firstName,
					middleName: middleName || undefined,
					lastName,
					email,
					username: username || undefined,
					phone: phone || undefined,
					location: location || undefined,
					demographics: demographics || undefined,
					password,
					inviteCode: inviteCode || undefined,
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.error || "Failed to register");
			}
			setSuccess("Registration successful. Please check your email to verify your account.");
		} catch (e: any) {
			setError(e?.message || "Failed to register");
		} finally {
			setLoading(false);
		}
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
							Create your account
						</h1>
						<p className="text-gray-600 dark:text-gray-400">We’ll email you a verification link.</p>
					</div>

					{registrationMode === "loading" ? (
						<div className="py-8 text-center text-gray-600 dark:text-gray-400 text-sm">
							Checking registration status...
						</div>
					) : registrationMode === "closed" ? (
						<div className="py-8 space-y-4 text-center">
							<p className="text-gray-700 dark:text-gray-300 font-medium">
								Registration is currently disabled.
							</p>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								The site administrator has turned off new user registration.
							</p>
						</div>
					) : (
					<form onSubmit={onSubmit} className="space-y-6">
						{error && (
							<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
								{error}
							</div>
						)}
						{success && (
							<div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
								{success}
							</div>
						)}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									First Name *
								</label>
								<input
									id="firstName"
									type="text"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									required
									className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label htmlFor="middleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Middle Name
								</label>
								<input
									id="middleName"
									type="text"
									value={middleName}
									onChange={(e) => setMiddleName(e.target.value)}
									className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Last Name *
								</label>
								<input
									id="lastName"
									type="text"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									required
									className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="you@example.com"
							/>
						</div>

						<div>
							<label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Email / Username (optional)
							</label>
							<input
								id="username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Defaults to your email if left blank"
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Phone (optional)
								</label>
								<input
									id="phone"
									type="tel"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Location (optional)
								</label>
								<input
									id="location"
									type="text"
									value={location}
									onChange={(e) => setLocation(e.target.value)}
									className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="City, Region, Country"
								/>
							</div>
						</div>

						<div>
							<label htmlFor="demographics" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Other details / demographics (optional)
							</label>
							<textarea
								id="demographics"
								rows={3}
								value={demographics}
								onChange={(e) => setDemographics(e.target.value)}
								className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
								placeholder="Anything else you'd like to share (role, experience level, interests, etc.)"
							/>
						</div>

						{registrationMode === "invite-only" && (
							<div>
								<label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Invite Code (required)
								</label>
								<input
									id="inviteCode"
									type="text"
									value={inviteCode}
									onChange={(e) => setInviteCode(e.target.value)}
									required
									className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter your invite code"
								/>
							</div>
						)}

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

						<AnimatedButton type="submit" variant="primary" disabled={loading} className="w-full">
							{loading ? "Creating..." : "Create account"}
						</AnimatedButton>
					</form>
					)}
				</div>
			</motion.div>
		</div>
	);
}


