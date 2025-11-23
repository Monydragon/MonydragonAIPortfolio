'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface TermsVersion {
  _id: string;
  version: string;
  content: string;
  effectiveDate: string;
  isActive: boolean;
  acceptanceCount: number;
  createdAt: string;
}

export default function TermsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [terms, setTerms] = useState<TermsVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchTerms();
    }
  }, [status, router]);

  const fetchTerms = async () => {
    try {
      const response = await fetch('/api/app-builder/terms/invalidate');
      const data = await response.json();
      setTerms(data.terms || []);
    } catch (error) {
      console.error('Error fetching terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewVersion = async () => {
    if (!newVersion || !newContent.trim()) {
      alert('Please provide both version number and content');
      return;
    }

    try {
      const response = await fetch('/api/app-builder/terms/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_new_version',
          newVersion,
          newContent: newContent.trim(),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`New terms version ${newVersion} created. All users must re-accept.`);
        setShowNewVersion(false);
        setNewVersion('');
        setNewContent('');
        await fetchTerms();
      } else {
        alert(data.error || 'Failed to create new version');
      }
    } catch (error) {
      console.error('Error creating new version:', error);
      alert('Failed to create new version');
    }
  };

  const handleInvalidateAll = async () => {
    if (!confirm('Are you sure you want to invalidate all terms? All users will need to re-accept.')) {
      return;
    }

    try {
      const response = await fetch('/api/app-builder/terms/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invalidate_all',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('All terms invalidated. Users must accept new terms.');
        await fetchTerms();
      } else {
        alert(data.error || 'Failed to invalidate terms');
      }
    } catch (error) {
      console.error('Error invalidating terms:', error);
      alert('Failed to invalidate terms');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const activeTerms = terms.find((t) => t.isActive);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Terms of Service Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage terms versions and force users to re-accept new terms
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Current Active Terms</h2>
              {activeTerms && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Version {activeTerms.version} • {activeTerms.acceptanceCount} users accepted
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewVersion(!showNewVersion)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {showNewVersion ? 'Cancel' : 'Create New Version'}
              </button>
              <button
                onClick={handleInvalidateAll}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Invalidate All
              </button>
            </div>
          </div>

          {showNewVersion && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h3 className="font-semibold mb-4">Create New Terms Version</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Version Number</label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    placeholder="e.g., 2.0, 1.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Terms Content (Markdown supported)</label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Enter the terms content here..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[400px] font-mono text-sm"
                  />
                </div>
                <button
                  onClick={handleCreateNewVersion}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Create New Version
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Terms History</h2>
          {terms.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No terms versions found</p>
          ) : (
            <div className="space-y-3">
              {terms.map((term) => (
                <div
                  key={term._id}
                  className={`p-4 border-2 rounded-lg ${
                    term.isActive
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Version {term.version}</h3>
                        {term.isActive && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Effective: {new Date(term.effectiveDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {term.acceptanceCount} users have accepted this version
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-3 rounded text-xs">
                    <pre className="whitespace-pre-wrap">{term.content.substring(0, 500)}...</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

