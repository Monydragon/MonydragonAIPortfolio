"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export default function SecurityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
    router.push("/login?next=/dashboard/security");
    return null;
  }

  const twoFactorEnabled = (session?.user as any)?.twoFactorEnabled;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <EmailVerificationBanner />
      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Account Security</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Review your security status and manage 2FA.
          </p>
        </div>

        <AnimatedCard>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Two-Factor Authentication (2FA)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              2FA adds an extra layer of protection to your account by requiring a one-time code from an
              authenticator app when you sign in.
            </p>
            <p className="text-sm">
              Status:{" "}
              {twoFactorEnabled ? (
                <span className="font-semibold text-green-700 dark:text-green-300">Enabled</span>
              ) : (
                <span className="font-semibold text-amber-700 dark:text-amber-300">Not enabled</span>
              )}
            </p>
            <AnimatedButton
              type="button"
              variant="primary"
              onClick={() => router.push("/settings/security")}
            >
              Manage 2FA Settings
            </AnimatedButton>
          </div>
        </AnimatedCard>
      </main>
    </div>
  );
}

