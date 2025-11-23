'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AppBuilderOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to App Builder',
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            Build apps with AI assistance and professional developer oversight. 
            Our service combines the power of AI with 20+ years of professional development experience.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">What You Get:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>AI-powered code generation</li>
              <li>Professional code review and refinement</li>
              <li>Multiple payment options to fit your needs</li>
              <li>Free tier to get started</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: 'How Credits Work',
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            Credits are token-based units used to generate code. The cost depends on the AI model you choose.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Free Tier</h4>
              <p className="text-sm">
                New users get free credits to start building. Perfect for non-commercial projects and learning.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Earn Credits</h4>
              <p className="text-sm">
                Play games, unlock achievements, and complete challenges to earn credits without spending money.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Purchase Credits</h4>
              <p className="text-sm">
                Buy credit packages when you need more. Bonus credits included in larger packages.
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Subscription</h4>
              <p className="text-sm">
                Monthly subscriptions provide credits plus priority support. Plans from $20/month.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Best Practices',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold">Start Small</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Begin with simple features and build complexity gradually. This saves credits and helps you learn.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold">Choose the Right Model</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Local models (Ollama) are free but slower. Cloud models (GPT, Claude) cost more but are faster and more powerful.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold">Be Specific</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Detailed prompts generate better code. Include requirements, technologies, and desired features.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-semibold">Iterate and Refine</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate code in iterations. Start with structure, then add features. This is more efficient than one large request.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                5
              </div>
              <div>
                <h4 className="font-semibold">Earn Credits by Playing</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Play games in our ecosystem to earn credits. The more you play, the more you earn!
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Payment Options',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-blue-200 dark:border-blue-800 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Per Hour</h4>
              <p className="text-sm mb-2">$20-$200/hour based on complexity</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Best for: Custom development with professional oversight
              </p>
            </div>
            <div className="border-2 border-purple-200 dark:border-purple-800 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Per Project</h4>
              <p className="text-sm mb-2">Fixed pricing based on scope</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Best for: Complete applications with defined requirements
              </p>
            </div>
            <div className="border-2 border-green-200 dark:border-green-800 p-4 rounded-lg">
              <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Credits</h4>
              <p className="text-sm mb-2">Pay-as-you-go token-based</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Best for: Flexible usage, small projects, experimentation
              </p>
            </div>
            <div className="border-2 border-orange-200 dark:border-orange-800 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">Subscription</h4>
              <p className="text-sm mb-2">$20-$500+/month with credits included</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Best for: Regular development, teams, priority support
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">App Builder Guide</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Learn how to use the App Builder service effectively
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => setCurrentStep(index)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      currentStep === index
                        ? 'bg-blue-500 text-white'
                        : currentStep > index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </button>
                  <p className="text-xs mt-2 text-center text-gray-600 dark:text-gray-400 hidden md:block">
                    {step.title.split(' ')[0]}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > index ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Current Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold mb-4">{steps[currentStep].title}</h2>
            {steps[currentStep].content}
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Next
              </button>
            ) : (
              <Link
                href="/sites/app-builder"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Start Building
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

