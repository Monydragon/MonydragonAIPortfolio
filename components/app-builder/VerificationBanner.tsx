'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function VerificationBanner() {
  const { data: session } = useSession();
  const [isVerified, setIsVerified] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      checkVerification();
    } else {
      setLoading(false);
    }
  }, [session]);

  const checkVerification = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      setIsVerified(!!data.user?.emailVerified);
    } catch (error) {
      console.error('Error checking verification:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || isVerified) {
    return null;
  }

  return (
    <div className="bg-yellow-500 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 px-4 py-3 mb-4 rounded-lg border border-yellow-600 dark:border-yellow-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold">Email Verification Required</p>
            <p className="text-sm">
              Please verify your email address to access App Builder features. Check your inbox for the verification email.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/security"
          className="px-4 py-2 bg-yellow-600 dark:bg-yellow-700 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-800 transition-colors text-sm font-semibold"
        >
          Verify Email
        </Link>
      </div>
    </div>
  );
}

