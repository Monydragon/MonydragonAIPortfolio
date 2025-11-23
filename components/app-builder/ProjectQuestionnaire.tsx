'use client';

import { useState } from 'react';

interface QuestionnaireData {
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  handsOn?: boolean; // true for hands-on (mentored), false for hands-off
  appType?: string;
  description?: string;
  features?: string[];
  budget?: string;
  timeline?: string;
  complexity?: string;
  techStack?: string[];
  targetAudience?: string;
  platform?: string[];
  integrations?: string[];
  estimatedHours?: number;
  hoursBreakdown?: {
    planning: number;
    design: number;
    development: number;
    testing: number;
    deployment: number;
    buffer: number;
  };
}

interface QuestionnaireProps {
  onComplete: (data: QuestionnaireData) => void;
  onCancel?: () => void;
}

export default function ProjectQuestionnaire({ onComplete, onCancel }: QuestionnaireProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QuestionnaireData>({});
  const [estimating, setEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  const totalSteps = 7;

  const updateData = (field: keyof QuestionnaireData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    // If on step 2 (hands-on/hands-off) and advanced/expert, skip to step 3
    if (step === 2 && (data.experienceLevel === 'advanced' || data.experienceLevel === 'expert')) {
      setStep(3);
      return;
    }

    // If on step 6 (before final step) and advanced/expert, estimate hours
    if (step === 6 && (data.experienceLevel === 'advanced' || data.experienceLevel === 'expert')) {
      await estimateHours();
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (onCancel) {
      onCancel();
    }
  };

  const estimateHours = async () => {
    if (!data.description) {
      setEstimateError('Please provide a project description first');
      return;
    }

    setEstimating(true);
    setEstimateError(null);

    try {
      const response = await fetch('/api/app-builder/estimate-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appType: data.appType,
          description: data.description,
          features: data.features,
          complexity: data.complexity,
          techStack: data.techStack,
          platforms: data.platform,
          integrations: data.integrations,
          targetAudience: data.targetAudience,
          experienceLevel: data.experienceLevel,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to estimate hours');
      }

      if (result.estimate) {
        updateData('estimatedHours', result.estimate.totalHours);
        updateData('hoursBreakdown', result.estimate.breakdown);
        setStep(step + 1); // Move to final step
      }
    } catch (error: any) {
      setEstimateError(error.message || 'Failed to estimate hours');
    } finally {
      setEstimating(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!data.experienceLevel;
      case 2:
        return data.handsOn !== undefined;
      case 3:
        return !!data.appType;
      case 4:
        return !!data.description;
      case 5:
        return true; // Features are optional
      case 6:
        return true; // Budget/timeline are optional
      case 7:
        return true; // Final step
      default:
        return true;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">Project Questionnaire</h2>
          <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1: Experience Level */}
        {step === 1 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">What's your experience level?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This helps us tailor the development approach to your needs.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'beginner', label: 'Beginner', desc: 'New to development, need guidance' },
                { value: 'intermediate', label: 'Intermediate', desc: 'Some experience, comfortable with basics' },
                { value: 'advanced', label: 'Advanced', desc: 'Experienced developer, need expert help' },
                { value: 'expert', label: 'Expert', desc: 'Senior developer, complex requirements' },
              ].map((level) => (
                <button
                  key={level.value}
                  onClick={() => updateData('experienceLevel', level.value)}
                  className={`p-4 rounded-lg border-2 transition-colors text-left ${
                    data.experienceLevel === level.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">{level.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Hands-on or Hands-off (only for beginner/intermediate) */}
        {step === 2 && (data.experienceLevel === 'beginner' || data.experienceLevel === 'intermediate') && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Development Approach</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose how you'd like to work on this project:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateData('handsOn', true)}
                className={`p-6 rounded-lg border-2 transition-colors text-left ${
                  data.handsOn === true
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="font-semibold text-lg mb-2">🤝 Hands-On (Mentored)</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Work directly with a mentor</li>
                    <li>Learn as you build</li>
                    <li>Real-time guidance and code reviews</li>
                    <li>Perfect for learning and growth</li>
                  </ul>
                </div>
              </button>
              <button
                onClick={() => updateData('handsOn', false)}
                className={`p-6 rounded-lg border-2 transition-colors text-left ${
                  data.handsOn === false
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="font-semibold text-lg mb-2">🚀 Hands-Off (Independent)</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Independent development</li>
                    <li>Professional code reviews</li>
                    <li>Architecture guidance when needed</li>
                    <li>Faster delivery, more autonomy</li>
                  </ul>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: App Type */}
        {step === 3 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">What type of application do you want to build?</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Web App', 'Mobile App', 'Desktop App', 'API/Backend', 'Full Stack', 'Other'].map((type) => (
                <button
                  key={type}
                  onClick={() => updateData('appType', type)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    data.appType === type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Description */}
        {step === 4 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Describe your application</h3>
            <textarea
              value={data.description || ''}
              onChange={(e) => updateData('description', e.target.value)}
              placeholder="Tell us about your app idea, what problem it solves, and what makes it unique..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[150px]"
            />
            {(data.experienceLevel === 'advanced' || data.experienceLevel === 'expert') && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                💡 The more details you provide, the more accurate our hour estimate will be.
              </p>
            )}
          </div>
        )}

        {/* Step 5: Features */}
        {step === 5 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Key Features</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              List the main features your app needs (e.g., User authentication, Payment processing, Real-time chat)
            </p>
            <div className="space-y-2">
              {(data.features || []).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...(data.features || [])];
                      newFeatures[index] = e.target.value;
                      updateData('features', newFeatures);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                  <button
                    onClick={() => {
                      const newFeatures = (data.features || []).filter((_, i) => i !== index);
                      updateData('features', newFeatures);
                    }}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => updateData('features', [...(data.features || []), ''])}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500"
              >
                + Add Feature
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Budget, Timeline, Complexity, Tech Stack */}
        {step === 6 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-4">Budget Range</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Under $100', '$100-$500', '$500-$2,000', '$2,000-$5,000', '$5,000+', 'Flexible'].map((budget) => (
                  <button
                    key={budget}
                    onClick={() => updateData('budget', budget)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      data.budget === budget
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {budget}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Timeline</h3>
              <div className="grid grid-cols-2 gap-3">
                {['ASAP', '1-2 weeks', '1 month', '2-3 months', '3+ months', 'Flexible'].map((timeline) => (
                  <button
                    key={timeline}
                    onClick={() => updateData('timeline', timeline)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      data.timeline === timeline
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {timeline}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Project Complexity</h3>
              <div className="space-y-2">
                {[
                  { value: 'simple', label: 'Simple - Basic features, standard patterns' },
                  { value: 'medium', label: 'Medium - Multiple features, some custom logic' },
                  { value: 'complex', label: 'Complex - Advanced features, custom architecture' },
                  { value: 'enterprise', label: 'Enterprise - Large scale, high performance' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${
                      data.complexity === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="complexity"
                      value={option.value}
                      checked={data.complexity === option.value}
                      onChange={(e) => updateData('complexity', e.target.value)}
                      className="mr-3"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Preferred Tech Stack (Optional)</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Python', 'Django', 'Flask', 'PHP', 'Laravel', 'Java', 'Spring', 'C#', '.NET', 'Go', 'Rust', 'Other'].map((tech) => (
                  <button
                    key={tech}
                    onClick={() => {
                      const stack = data.techStack || [];
                      if (stack.includes(tech)) {
                        updateData('techStack', stack.filter((t) => t !== tech));
                      } else {
                        updateData('techStack', [...stack, tech]);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      (data.techStack || []).includes(tech)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {tech} {(data.techStack || []).includes(tech) && '✓'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {['Web', 'iOS', 'Android', 'Windows', 'macOS', 'Linux', 'Cross-platform'].map((platform) => (
                  <button
                    key={platform}
                    onClick={() => {
                      const platforms = data.platform || [];
                      if (platforms.includes(platform)) {
                        updateData('platform', platforms.filter((p) => p !== platform));
                      } else {
                        updateData('platform', [...platforms, platform]);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      (data.platform || []).includes(platform)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {platform} {(data.platform || []).includes(platform) && '✓'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Integrations Needed (Optional)</h3>
              <div className="flex flex-wrap gap-2">
                {['Payment (Stripe/PayPal)', 'Email (SendGrid/Mailgun)', 'SMS (Twilio)', 'Auth (OAuth/Social)', 'Database (MongoDB/PostgreSQL)', 'Cloud Storage (AWS/S3)', 'Analytics (Google Analytics)', 'Other'].map((integration) => (
                  <button
                    key={integration}
                    onClick={() => {
                      const integrations = data.integrations || [];
                      if (integrations.includes(integration)) {
                        updateData('integrations', integrations.filter((i) => i !== integration));
                      } else {
                        updateData('integrations', [...integrations, integration]);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors text-sm ${
                      (data.integrations || []).includes(integration)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {integration} {(data.integrations || []).includes(integration) && '✓'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Target Audience</h3>
              <input
                type="text"
                value={data.targetAudience || ''}
                onChange={(e) => updateData('targetAudience', e.target.value)}
                placeholder="e.g., Small businesses, Individual users, Enterprise clients..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        )}

        {/* Step 7: Hours Estimate (for advanced/expert) or Final Summary */}
        {step === 7 && (
          <div>
            {data.estimatedHours ? (
              <div>
                <h3 className="text-xl font-semibold mb-4">Estimated Hours</h3>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {data.estimatedHours} hours
                  </div>
                  {data.hoursBreakdown && (
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Planning:</span>
                        <span className="font-semibold">{data.hoursBreakdown.planning}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Design:</span>
                        <span className="font-semibold">{data.hoursBreakdown.design}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Development:</span>
                        <span className="font-semibold">{data.hoursBreakdown.development}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Testing:</span>
                        <span className="font-semibold">{data.hoursBreakdown.testing}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deployment:</span>
                        <span className="font-semibold">{data.hoursBreakdown.deployment}h</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span>Buffer (15%):</span>
                        <span className="font-semibold">{data.hoursBreakdown.buffer}h</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This estimate is based on your project requirements and complexity level. 
                  Actual hours may vary based on specific implementation details.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold mb-4">Review Your Project</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Experience Level:</strong> {data.experienceLevel}</p>
                  {data.handsOn !== undefined && (
                    <p><strong>Approach:</strong> {data.handsOn ? 'Hands-On (Mentored)' : 'Hands-Off (Independent)'}</p>
                  )}
                  <p><strong>App Type:</strong> {data.appType}</p>
                  <p><strong>Complexity:</strong> {data.complexity}</p>
                  {data.budget && <p><strong>Budget:</strong> {data.budget}</p>}
                  {data.timeline && <p><strong>Timeline:</strong> {data.timeline}</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estimating indicator */}
        {estimating && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-center text-blue-600 dark:text-blue-400">
              🤖 AI is analyzing your project and estimating hours...
            </p>
          </div>
        )}

        {/* Estimate error */}
        {estimateError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{estimateError}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="px-6 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed() || estimating}
          className={`px-6 py-2 rounded-lg transition-colors ${
            !canProceed() || estimating
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {estimating
            ? 'Estimating...'
            : step === 6 && (data.experienceLevel === 'advanced' || data.experienceLevel === 'expert')
            ? 'Estimate Hours'
            : step === totalSteps
            ? 'Complete'
            : 'Next'}
        </button>
      </div>
    </div>
  );
}
