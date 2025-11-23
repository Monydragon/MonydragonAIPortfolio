'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
  const [terms, setTerms] = useState<{ version: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await fetch('/api/app-builder/terms');
      const data = await response.json();
      setTerms(data);
    } catch (error) {
      console.error('Error fetching terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!terms || !accepted) return;

    setRedirecting(true);

    try {
      console.log('Accepting terms version:', terms.version);
      
      const response = await fetch('/api/app-builder/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: terms.version }),
        credentials: 'include', // Ensure cookies are sent
      });

      console.log('Response status:', response.status, response.statusText);

      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        const text = await response.text();
        console.error('Response text:', text);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.accepted || data.message) {
        console.log('Terms accepted successfully, redirecting...');
        // Store acceptance in localStorage to prevent immediate re-check
        if (terms?.version) {
          localStorage.setItem('termsAccepted', terms.version);
          localStorage.setItem('termsAcceptedTime', Date.now().toString());
        }
        // Use window.location.replace to prevent back button issues
        // Add a small delay to ensure database is updated
        setTimeout(() => {
          window.location.replace('/sites/app-builder');
        }, 500);
      } else {
        setRedirecting(false);
        const errorMsg = data.error || 'Failed to accept terms. Please try again.';
        console.error('Terms acceptance failed:', data);
        alert(errorMsg);
      }
    } catch (error: any) {
      console.error('Error accepting terms:', error);
      setRedirecting(false);
      const errorMsg = error?.message || 'Failed to accept terms. Please check your connection and try again.';
      alert(`Error: ${errorMsg}\n\nPlease make sure you are logged in and try again.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading terms...</p>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-green-600 dark:text-green-400 text-lg mb-2">✓ Terms Accepted</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Redirecting to App Builder...</p>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            If you're not redirected automatically,{' '}
            <a href="/sites/app-builder" className="text-blue-500 hover:underline">
              click here
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Terms of Service - App Builder</h1>
          
          {terms && (
            <div className="mb-8 max-h-[60vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
              <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                {terms.content.split(/\n\n+/).map((paragraph, pIndex) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;
                  
                  if (trimmed.startsWith('# ')) {
                    return <h1 key={pIndex} className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">{trimmed.replace(/^# /, '')}</h1>;
                  }
                  if (trimmed.startsWith('## ')) {
                    return <h2 key={pIndex} className="text-xl font-bold mt-5 mb-3 text-gray-900 dark:text-white">{trimmed.replace(/^## /, '')}</h2>;
                  }
                  if (trimmed.startsWith('### ')) {
                    return <h3 key={pIndex} className="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200">{trimmed.replace(/^### /, '')}</h3>;
                  }
                  if (trimmed.startsWith('- ')) {
                    const items = trimmed.split('\n').filter(l => l.startsWith('- '));
                    return (
                      <ul key={pIndex} className="list-disc ml-6 mb-4 space-y-1">
                        {items.map((item, i) => (
                          <li key={i} className="text-gray-700 dark:text-gray-300">
                            {item.replace(/^- /, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p 
                      key={pIndex} 
                      className="mb-3 text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{
                        __html: trimmed
                          .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
                          .replace(/\n/g, '<br />')
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <div className="flex items-center space-x-4 mb-4">
              <input
                type="checkbox"
                id="accept"
                className="w-5 h-5"
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <label htmlFor="accept" className="text-lg">
                I have read and agree to the Terms of Service
              </label>
            </div>
            <button
              onClick={handleAccept}
              disabled={!accepted || redirecting}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                accepted && !redirecting
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {redirecting ? 'Processing...' : 'Accept and Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

