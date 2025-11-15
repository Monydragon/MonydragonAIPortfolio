"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

type Message = { type: "error" | "success"; text: string };

export default function CreateMonyAdminPage() {
  const router = useRouter();
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      setCheckingAdmin(true);
      try {
        const res = await fetch("/api/admin/seed");
        if (!res.ok) {
          throw new Error("Failed to check admin status");
        }
        const data = await res.json();
        setHasAdmin(Boolean(data.hasAdmin));
      } catch {
        // Fail-safe: assume admin exists if we can't check
        setHasAdmin(true);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name || !email || !password) {
      setMessage({
        type: "error",
        text: "Please enter name, email, and password.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create admin user");
      }

      setMessage({
        type: "success",
        text: "Admin account created successfully. You can now log in.",
      });

      setHasAdmin(true);

      // After a short delay, redirect to login
      setTimeout(() => {
        router.push("/MonyAdmin/login");
      }, 1500);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to create admin user",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push("/MonyAdmin/login");
  };


  const disabled = checkingAdmin || hasAdmin === true;

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
              Create Admin Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              This page is only intended for creating the very first admin
              account. Once an admin exists, you should log in instead.
            </p>
          </div>

          {checkingAdmin && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Checking admin status...
            </p>
          )}

          {!checkingAdmin && hasAdmin === true && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-200">
                An admin account already exists. Please use the login page to
                sign in.
              </div>
              <AnimatedButton
                type="button"
                variant="primary"
                className="w-full"
                onClick={handleGoToLogin}
              >
                Go to Login
              </AnimatedButton>
            </div>
          )}

          {!checkingAdmin && hasAdmin === false && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.type === "success"
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-200"
                      : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="space-y-3">
                <AnimatedButton
                  type="submit"
                  variant="primary"
                  disabled={loading || disabled}
                  className="w-full"
                >
                  {loading ? "Creating..." : "Create Admin"}
                </AnimatedButton>
                <AnimatedButton
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={loading}
                  onClick={handleGoToLogin}
                >
                  Back to Login
                </AnimatedButton>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}


