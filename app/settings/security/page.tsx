"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";

export default function SettingsSecurityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    !!(session?.user as any)?.twoFactorEnabled,
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading security settings...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login?next=/settings/security");
    return null;
  }

  const handleStart2FASetup = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start 2FA setup");
      }
      setQrDataUrl(data.qrDataUrl);
      setSecret(data.secret);
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Failed to start 2FA setup" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage(null);
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify code");
      }
      setTwoFactorEnabled(true);
      setQrDataUrl(null);
      setSecret(null);
      setCode("");
      setMessage({ type: "success", text: "Two-factor authentication has been enabled." });
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Failed to verify code" });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("Are you sure you want to disable 2FA? This is not recommended.")) return;

    try {
      setLoading(true);
      setMessage(null);
      const res = await fetch("/api/auth/2fa/disable", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to disable 2FA");
      }
      setTwoFactorEnabled(false);
      setQrDataUrl(null);
      setSecret(null);
      setCode("");
      setMessage({ type: "success", text: "Two-factor authentication has been disabled." });
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Failed to disable 2FA" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <EmailVerificationBanner />
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Account Security</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your sign-in security and two-factor authentication (2FA).
          </p>
        </div>

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

        <AnimatedCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Two-Factor Authentication (2FA)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              2FA adds an extra layer of security to your account by requiring a one-time code from an
              authenticator app in addition to your password. This is{" "}
              <span className="font-semibold">highly recommended</span>.
            </p>

            {twoFactorEnabled ? (
              <div className="space-y-3">
                <p className="text-sm text-green-700 dark:text-green-300">
                  2FA is currently <span className="font-semibold">enabled</span> on your account.
                </p>
                <AnimatedButton
                  type="button"
                  variant="secondary"
                  onClick={handleDisable2FA}
                  disabled={loading}
                >
                  {loading ? "Disabling..." : "Disable 2FA"}
                </AnimatedButton>
              </div>
            ) : (
              <div className="space-y-4">
                {!qrDataUrl ? (
                  <AnimatedButton
                    type="button"
                    variant="primary"
                    onClick={handleStart2FASetup}
                    disabled={loading}
                  >
                    {loading ? "Starting..." : "Enable 2FA"}
                  </AnimatedButton>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Step 1: Install an authenticator app</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          On your Android or iOS device, install{" "}
                          <span className="font-semibold">Google Authenticator</span> or{" "}
                          <span className="font-semibold">Microsoft Authenticator</span> from the app store.
                        </p>
                        <h3 className="text-sm font-semibold">Step 2: Scan the QR code</h3>
                        <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>Open the authenticator app.</li>
                          <li>Tap the &quot;+&quot; or &quot;Add account&quot; button.</li>
                          <li>Select &quot;Scan QR code&quot;.</li>
                          <li>Point your camera at the QR code on this page.</li>
                        </ol>
                        {secret && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            If you can&apos;t scan the QR code, manually enter this secret in your app:{" "}
                            <span className="font-mono break-all">{secret}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-center justify-center gap-3">
                        {qrDataUrl && (
                          <img
                            src={qrDataUrl}
                            alt="2FA QR Code"
                            className="w-40 h-40 border border-gray-200 dark:border-gray-700 rounded-lg bg-white"
                          />
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          Scan this code with your authenticator app.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleVerify2FA} className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Step 3: Enter the 6‑digit code from your app
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          required
                          className="w-full sm:w-48 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="123456"
                        />
                        <AnimatedButton type="submit" disabled={loading}>
                          {loading ? "Verifying..." : "Verify & enable 2FA"}
                        </AnimatedButton>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        This code changes every 30 seconds. If it fails, wait for the next code and try again.
                      </p>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        </AnimatedCard>
      </main>
    </div>
  );
}

