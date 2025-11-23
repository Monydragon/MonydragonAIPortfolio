'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CreditBalance from '@/components/app-builder/CreditBalance';

interface Project {
  _id: string;
  title: string;
  status: string;
  queuePosition?: number;
  createdAt: string;
}

interface Offer {
  _id: string;
  title: string;
  type: string;
  url: string;
  creditsReward: number;
  description: string;
}

export default function AppBuilderDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [creditInfo, setCreditInfo] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?next=/sites/app-builder/dashboard');
      return;
    }
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const [projectsRes, offersRes, creditsRes, referralRes] = await Promise.all([
        fetch('/api/app-builder/projects'),
        fetch('/api/app-builder/offers'),
        fetch('/api/app-builder/credits'),
        fetch('/api/app-builder/referral/code'),
      ]);

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data.projects || []);
      }

      if (offersRes.ok) {
        const data = await offersRes.json();
        setOffers(data.offers || []);
      }

      if (creditsRes.ok) {
        const data = await creditsRes.json();
        setCreditInfo(data);
      }

      if (referralRes.ok) {
        const data = await referralRes.json();
        setReferralCode(data.code || '');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">App Builder Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your projects, credits, and earn more by exploring offers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Credit Balance */}
          <div className="lg:col-span-1">
            <CreditBalance />
          </div>

          {/* Referral Code */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Referral Program</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Share your referral code and earn credits when others sign up!
            </p>
            {referralCode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/register?ref=${referralCode}`);
                      alert('Referral link copied!');
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Copy Link
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  You'll earn credits when someone signs up using your referral code
                </p>
              </div>
            ) : (
              <button
                onClick={async () => {
                  const res = await fetch('/api/app-builder/referral/generate', { method: 'POST' });
                  const data = await res.json();
                  if (data.code) {
                    setReferralCode(data.code);
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Generate Referral Code
              </button>
            )}
          </div>
        </div>

        {/* Offers Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Earn Credits</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Play games, try apps, and visit websites to earn credits!
          </p>
          {offers.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No offers available at the moment</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map((offer) => (
                <div key={offer._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{offer.title}</h3>
                    <span className="text-sm px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded">
                      +{offer.creditsReward} credits
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{offer.description}</p>
                  <div className="flex gap-2">
                    <a
                      href={offer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Visit
                    </a>
                    <button
                      onClick={async () => {
                        const res = await fetch(`/api/app-builder/offers/${offer._id}/claim`, { method: 'POST' });
                        const data = await res.json();
                        if (data.success) {
                          alert(`You earned ${data.credits} credits!`);
                          await fetchData();
                        }
                      }}
                      className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      Claim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Your Projects</h2>
            <Link
              href="/sites/app-builder"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              New Project
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No projects yet. Create your first project!</p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{project.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{project.status}</p>
                      {project.queuePosition && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Queue Position: #{project.queuePosition}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/sites/app-builder/projects/${project._id}`}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 text-sm"
                    >
                      View
                    </Link>
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

