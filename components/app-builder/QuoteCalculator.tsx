'use client';

import { useState, useEffect } from 'react';

interface QuoteResult {
  paymentType: string;
  breakdown: Record<string, string>;
  total: number;
  totalFormatted?: string;
  hourlyRate?: number;
  estimatedHours?: number;
  estimatedCredits?: number;
  tiers?: Array<{
    name: string;
    price: number;
    credits: number;
    description: string;
    features?: string[];
  }>;
}

type ExperienceLevel = 'beginner' | 'experienced' | 'expert';

export default function QuoteCalculator() {
  const [paymentType, setPaymentType] = useState<'per_hour' | 'per_project' | 'subscription' | 'credits'>('per_hour');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('beginner');
  const [estimatedHours, setEstimatedHours] = useState(10);
  const [complexity, setComplexity] = useState<'simple' | 'medium' | 'complex' | 'enterprise'>('medium');
  const [appType, setAppType] = useState('web');
  const [features, setFeatures] = useState<string[]>([]);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Experience level presets
  const experiencePresets = {
    beginner: {
      description: 'Perfect for first-time app builders',
      guidance: 'Start with simple features, use free credits, and learn as you build.',
      recommendedPayment: 'credits' as const,
      showExamples: true,
    },
    experienced: {
      description: 'For developers familiar with app development',
      guidance: 'You can handle more complexity. Consider subscriptions for regular development.',
      recommendedPayment: 'subscription' as const,
      showExamples: true,
    },
    expert: {
      description: 'Full control over all options',
      guidance: 'All features available. Choose the payment method that best fits your needs.',
      recommendedPayment: 'per_project' as const,
      showExamples: false,
    },
  };

  useEffect(() => {
    calculateQuote();
  }, [paymentType, estimatedHours, complexity, appType, experienceLevel, features]);

  const calculateQuote = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/app-builder/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentType,
          estimatedHours,
          complexity,
          appType,
          features: features.length > 0 ? features : undefined,
        }),
      });

      const data = await response.json();
      if (data.quote) {
        setQuote(data.quote);
      }
    } catch (error) {
      console.error('Error calculating quote:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    const feature = prompt('Enter a feature (e.g., "User authentication", "Payment processing"):');
    if (feature && feature.trim()) {
      setFeatures([...features, feature.trim()]);
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Get Your Quote</h2>

      <div className="space-y-6">
        {/* Experience Level Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Experience Level</label>
          <div className="grid grid-cols-3 gap-3 mb-2">
            {(['beginner', 'experienced', 'expert'] as ExperienceLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setExperienceLevel(level)}
                className={`px-4 py-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                  experienceLevel === level
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="capitalize">{level}</div>
                <div className="text-xs mt-1 opacity-75">{experiencePresets[level].description}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 italic">
            {experiencePresets[experienceLevel].guidance}
          </p>
        </div>

        {/* Payment Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Payment Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['per_hour', 'per_project', 'subscription', 'credits'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setPaymentType(type)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors text-sm ${
                  paymentType === type
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                {type === 'per_hour' && 'Per Hour'}
                {type === 'per_project' && 'Per Project'}
                {type === 'subscription' && 'Subscription'}
                {type === 'credits' && 'Credits'}
              </button>
            ))}
          </div>
        </div>

        {/* Beginner/Experienced Guidance */}
        {(experienceLevel === 'beginner' || experienceLevel === 'experienced') && experiencePresets[experienceLevel].showExamples && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              💡 {experienceLevel === 'beginner' ? 'Getting Started Tips' : 'Recommended Approach'}
            </h4>
            {paymentType === 'credits' && (
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 list-disc list-inside">
                <li>Start with free credits to learn the system</li>
                <li>Earn more credits by playing games from trusted developers</li>
                <li>Perfect for small projects and experimentation</li>
                <li>Pay only for what you use</li>
              </ul>
            )}
            {paymentType === 'subscription' && (
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 list-disc list-inside">
                <li>Get priority support with faster response times</li>
                <li>Monthly credits included - no need to track individual purchases</li>
                <li>Best value for regular development work</li>
                <li>Earn additional credits by playing games</li>
              </ul>
            )}
            {paymentType === 'per_hour' && (
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 list-disc list-inside">
                <li>Best for custom development with professional oversight</li>
                <li>Direct collaboration with 20+ year professional developer</li>
                <li>Ideal for complex requirements</li>
              </ul>
            )}
            {paymentType === 'per_project' && (
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 list-disc list-inside">
                <li>Fixed price for complete projects</li>
                <li>Clear scope and deliverables</li>
                <li>Best for well-defined requirements</li>
              </ul>
            )}
          </div>
        )}

        {/* Dynamic Fields Based on Payment Type */}
        {paymentType !== 'subscription' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                {paymentType === 'per_hour' || paymentType === 'per_project' ? 'Estimated Hours' : 'App Type'}
              </label>
              {paymentType === 'credits' ? (
                <select
                  value={appType}
                  onChange={(e) => setAppType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="web">Web App</option>
                  <option value="mobile">Mobile App</option>
                  <option value="desktop">Desktop App</option>
                  <option value="api">API/Backend</option>
                </select>
              ) : (
                <input
                  type="number"
                  min="1"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Complexity</label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="simple">Simple - Basic features, standard patterns</option>
                <option value="medium">Medium - Multiple features, some custom logic</option>
                <option value="complex">Complex - Advanced features, custom architecture</option>
                <option value="enterprise">Enterprise - Large scale, high performance</option>
              </select>
            </div>

            {/* Expert mode: Feature list */}
            {experienceLevel === 'expert' && (
              <div>
                <label className="block text-sm font-medium mb-2">Key Features (Optional)</label>
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">{feature}</span>
                      <button
                        onClick={() => removeFeature(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addFeature}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors text-sm"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Subscription Tiers with Advantages */}
        {paymentType === 'subscription' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">✨ Subscription Advantages</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                <li><strong>Priority Support:</strong> Faster response times and dedicated assistance</li>
                <li><strong>Monthly Credits:</strong> Predictable costs with credits included each month</li>
                <li><strong>Earn More:</strong> Play games from trusted developers to earn additional credits</li>
                <li><strong>Best Value:</strong> Lower cost per credit compared to one-time purchases</li>
                <li><strong>Professional Oversight:</strong> All code reviewed by 20+ year professional developer</li>
              </ul>
            </div>
          </div>
        )}

        {/* Quote Result */}
        {quote && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold mb-2">Estimated Cost</h3>
            {paymentType === 'subscription' && quote.tiers ? (
              <div className="space-y-3">
                {quote.tiers.map((tier) => (
                  <div key={tier.name} className="p-4 bg-white dark:bg-gray-800 rounded border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold capitalize text-lg">{tier.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{tier.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${tier.price}/month</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{tier.credits} credits/month</p>
                      </div>
                    </div>
                    {tier.features && (
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mt-2">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        🎮 Earn additional credits by playing games from trusted developers!
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {quote.totalFormatted || `$${quote.total.toFixed(2)}`}
                </p>
                {quote.breakdown && (
                  <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {Object.entries(quote.breakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {paymentType === 'credits' && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      💡 Tip: Earn credits for free by playing games from trusted developers!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-600 dark:text-gray-400">Calculating...</p>
          </div>
        )}
      </div>
    </div>
  );
}
