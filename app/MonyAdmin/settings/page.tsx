"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters long" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setMessage({ type: "success", text: "Password changed successfully!" });
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Optionally sign out after password change
      setTimeout(() => {
        signOut({ redirect: false });
        router.push("/MonyAdmin/login");
      }, 2000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to change password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your account settings
              </p>
            </div>
            <Link href="/MonyAdmin">
              <AnimatedButton variant="secondary">Back to Dashboard</AnimatedButton>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
              }`}
            >
              {message.text}
            </motion.div>
          )}

          {/* Account Info */}
          <AnimatedCard>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Account Information
              </h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white">{session?.user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white">{session?.user?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Role
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white capitalize">
                    {(session?.user as any)?.role || "admin"}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Change Password */}
          <AnimatedCard>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Change Password
              </h2>
              
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  required
                  minLength={8}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                  minLength={8}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <AnimatedButton
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Changing Password..." : "Change Password"}
              </AnimatedButton>
            </form>
          </AnimatedCard>
        </div>
      </main>
    </div>
  );
}

