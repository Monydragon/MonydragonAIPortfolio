'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Settings {
  enabled: boolean;
  freeTier: {
    credits: number;
    creditsPerMonth: number;
    responseTime: string;
    features: string[];
  };
  starterTier: {
    monthlyPrice: number;
    creditsPerMonth: number;
    responseTime: string;
    additionalCreditPrice: number;
    features: string[];
  };
  professionalTier: {
    monthlyPrice: number;
    creditsPerMonth: number;
    responseTime: string;
    additionalCreditPrice: number;
    features: string[];
  };
  enterpriseTier: {
    monthlyPrice: number;
    creditsPerMonth: number;
    responseTime: string;
    additionalCreditPrice: number;
    features: string[];
  };
  referralCredits: number;
  kickoffMeetingEnabled: boolean;
  kickoffMeetingPrice: number;
}

export default function AppBuilderSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/app-builder/settings');
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch('/api/app-builder/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateNestedField = (path: string[], value: any) => {
    if (!settings) return;
    const newSettings = { ...settings };
    let current: any = newSettings;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]] = { ...current[path[i]] };
    }
    current[path[path.length - 1]] = value;
    setSettings(newSettings);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">App Builder Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize App Builder tiers, pricing, and features
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div>
              <h3 className="font-semibold">Enable App Requests</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                When disabled, users will see a message that projects are full
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Free Tier */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4">Free Tier</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Initial Credits</label>
                <input
                  type="number"
                  value={settings.freeTier.credits}
                  onChange={(e) => updateNestedField(['freeTier', 'credits'], parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Credits Per Month</label>
                <input
                  type="number"
                  value={settings.freeTier.creditsPerMonth}
                  onChange={(e) => updateNestedField(['freeTier', 'creditsPerMonth'], parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Response Time</label>
                <input
                  type="text"
                  value={settings.freeTier.responseTime}
                  onChange={(e) => updateNestedField(['freeTier', 'responseTime'], e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Starter Tier */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4">Starter Tier</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.starterTier.monthlyPrice}
                  onChange={(e) => updateNestedField(['starterTier', 'monthlyPrice'], parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Credits Per Month</label>
                <input
                  type="number"
                  value={settings.starterTier.creditsPerMonth}
                  onChange={(e) => updateNestedField(['starterTier', 'creditsPerMonth'], parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Response Time</label>
                <input
                  type="text"
                  value={settings.starterTier.responseTime}
                  onChange={(e) => updateNestedField(['starterTier', 'responseTime'], e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Additional Credit Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.starterTier.additionalCreditPrice}
                  onChange={(e) => updateNestedField(['starterTier', 'additionalCreditPrice'], parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Professional Tier */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4">Professional Tier</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.professionalTier.monthlyPrice}
                  onChange={(e) => updateNestedField(['professionalTier', 'monthlyPrice'], parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Credits Per Month</label>
                <input
                  type="number"
                  value={settings.professionalTier.creditsPerMonth}
                  onChange={(e) => updateNestedField(['professionalTier', 'creditsPerMonth'], parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Response Time</label>
                <input
                  type="text"
                  value={settings.professionalTier.responseTime}
                  onChange={(e) => updateNestedField(['professionalTier', 'responseTime'], e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Additional Credit Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.professionalTier.additionalCreditPrice}
                  onChange={(e) => updateNestedField(['professionalTier', 'additionalCreditPrice'], parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Enterprise Tier */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4">Enterprise Tier</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.enterpriseTier.monthlyPrice}
                  onChange={(e) => updateNestedField(['enterpriseTier', 'monthlyPrice'], parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Credits Per Month</label>
                <input
                  type="number"
                  value={settings.enterpriseTier.creditsPerMonth}
                  onChange={(e) => updateNestedField(['enterpriseTier', 'creditsPerMonth'], parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Response Time</label>
                <input
                  type="text"
                  value={settings.enterpriseTier.responseTime}
                  onChange={(e) => updateNestedField(['enterpriseTier', 'responseTime'], e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Additional Credit Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.enterpriseTier.additionalCreditPrice}
                  onChange={(e) => updateNestedField(['enterpriseTier', 'additionalCreditPrice'], parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Referral & Kickoff */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Referral Credits</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Credits Per Referral</label>
                <input
                  type="number"
                  value={settings.referralCredits}
                  onChange={(e) => setSettings({ ...settings, referralCredits: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Kickoff Meeting</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.kickoffMeetingEnabled}
                    onChange={(e) => setSettings({ ...settings, kickoffMeetingEnabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span>Enable Kickoff Meetings</span>
                </label>
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.kickoffMeetingPrice}
                    onChange={(e) => setSettings({ ...settings, kickoffMeetingPrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                saving
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

