'use client';

import { useState, useEffect } from 'react';

interface CreditInfo {
  balance: number;
  pricing: Array<{
    credits: number;
    price: number;
    bonus?: number;
  }>;
}

export default function CreditBalance() {
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPurchase, setShowPurchase] = useState(false);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/app-builder/credits');
      const data = await response.json();
      setCreditInfo(data);
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (credits: number, price: number) => {
    try {
      const response = await fetch('/api/app-builder/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits, paymentProcessor: 'paypal' }),
      });

      const data = await response.json();
      if (data.paymentId) {
        // In production, redirect to PayPal checkout
        alert(`Redirecting to PayPal checkout for $${price.toFixed(2)}...`);
        // window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Error initiating purchase:', error);
      alert('Failed to initiate purchase. Please try again.');
    }
  };

  const claimFreeCredits = async () => {
    try {
      const response = await fetch('/api/app-builder/credits/free', {
        method: 'POST',
      });

      const data = await response.json();
      if (data.balance !== undefined) {
        await fetchCredits();
        alert(`You received ${data.credits} free credits!`);
      }
    } catch (error: any) {
      const errorData = await (error as any).json?.();
      if (errorData?.error) {
        alert(errorData.error);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-600 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Credit Balance</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {creditInfo?.balance || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">credits available</p>
        </div>
        <div className="space-y-2">
          <button
            onClick={claimFreeCredits}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            Claim Free Credits
          </button>
          <button
            onClick={() => setShowPurchase(!showPurchase)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            {showPurchase ? 'Hide' : 'Buy Credits'}
          </button>
        </div>
      </div>

      {showPurchase && creditInfo?.pricing && (
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold">Purchase Credits</h4>
          {creditInfo.pricing.map((package_) => {
            const totalCredits = package_.credits + (package_.bonus || 0);
            return (
              <div
                key={package_.credits}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {totalCredits} credits
                    {package_.bonus && (
                      <span className="text-green-600 dark:text-green-400 text-sm ml-2">
                        (+{package_.bonus} bonus)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${package_.price.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => handlePurchase(package_.credits, package_.price)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Buy
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

