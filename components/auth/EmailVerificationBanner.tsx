"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export function EmailVerificationBanner() {
  const { data: session } = useSession();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user data to check email verification and admin status
  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/users?includeRoles=true&limit=1&search=${encodeURIComponent(session.user.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.users && data.users.length > 0) {
            const user = data.users[0];
            setEmailVerified(!!user.emailVerified);
            // Check if user has Administrator role
            const hasAdminRole = user.roles?.some((r: any) => r.name === 'Administrator');
            setIsAdmin(hasAdminRole);
          }
        })
        .catch(() => {
          // Fallback to session data
          setEmailVerified(!!(session?.user as any)?.emailVerified);
        });
    } else {
      setEmailVerified(!!(session?.user as any)?.emailVerified);
    }
  }, [session]);

  // Don't show banner for admins (they're always verified) or if email is verified
  if (!session?.user || emailVerified || isAdmin) {
    return null;
  }

  const handleResend = async () => {
    try {
      setSending(true);
      setError(null);
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resend verification email");
      }
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Failed to resend verification email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            Your email is not verified.
          </p>
          <p className="text-xs text-amber-800/90 dark:text-amber-200/90">
            Some features may be limited until you verify your email address.
          </p>
          {error && (
            <p className="mt-1 text-xs text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <AnimatedButton
            type="button"
            variant="secondary"
            onClick={handleResend}
            disabled={sending || sent}
            className="px-3 py-1 text-xs"
          >
            {sending ? "Sending..." : sent ? "Email sent" : "Resend verification email"}
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}


