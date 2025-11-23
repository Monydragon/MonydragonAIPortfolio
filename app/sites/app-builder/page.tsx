'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QuoteCalculator from '@/components/app-builder/QuoteCalculator';
import ModelSelector from '@/components/app-builder/ModelSelector';
import CreditBalance from '@/components/app-builder/CreditBalance';
import VerificationBanner from '@/components/app-builder/VerificationBanner';
import ProjectQuestionnaire from '@/components/app-builder/ProjectQuestionnaire';

interface Project {
  _id: string;
  title: string;
  description: string;
  appType: string;
  paymentType: string;
  status: string;
  creditsUsed: number;
  tokensUsed: number;
}

export default function AppBuilderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [userVerified, setUserVerified] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      checkTermsAcceptance();
      fetchProjects();
      fetchSettings();
      checkVerification();
    }
  }, [status, router]);

  const checkTermsAcceptance = async () => {
    try {
      // Check localStorage first to avoid unnecessary redirects right after acceptance
      if (typeof window !== 'undefined') {
        const acceptedVersion = localStorage.getItem('termsAccepted');
        const acceptedTime = localStorage.getItem('termsAcceptedTime');
        // If accepted within last 5 seconds, skip check to prevent redirect loop
        if (acceptedVersion && acceptedTime) {
          const timeDiff = Date.now() - parseInt(acceptedTime);
          if (timeDiff < 5000) {
            return; // Skip check if just accepted
          }
        }
      }

      // Check if user has accepted current terms
      const checkResponse = await fetch('/api/app-builder/terms/check', {
        cache: 'no-store', // Always check fresh
      });
      const check = await checkResponse.json();
      
      // Update localStorage if accepted
      if (check.accepted && check.version && typeof window !== 'undefined') {
        localStorage.setItem('termsAccepted', check.version);
        localStorage.setItem('termsAcceptedTime', Date.now().toString());
      }
      
      // Only redirect if not accepted AND we're not already on the terms page
      if (!check.accepted && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/app-builder/terms') && !currentPath.includes('/terms')) {
          router.push('/app-builder/terms');
        }
      }
    } catch (error) {
      console.error('Error checking terms:', error);
      // Don't block access if check fails
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/app-builder/projects');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/app-builder/settings');
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const checkVerification = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      setUserVerified(!!data.user?.emailVerified);
    } catch (error) {
      console.error('Error checking verification:', error);
    }
  };

  const createProject = async (projectData: any) => {
    try {
      const response = await fetch('/api/app-builder/projects/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();
      if (data.project) {
        setProjects([data.project, ...projects]);
        setSelectedProject(data.project);
        setShowNewProject(false);
        setShowQuestionnaire(false);
        alert('Project request created successfully!');
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      alert(error.message || 'Failed to create project. Please try again.');
    }
  };

  const handleQuestionnaireComplete = async (questionnaireData: any) => {
    // After questionnaire, show quote options
    setShowQuestionnaire(false);
    // The quote calculator will handle showing options
  };

  const generateCode = async () => {
    if (!selectedProject || !prompt || !selectedProvider || !selectedModel) {
      alert('Please select a project, enter a prompt, and choose a model.');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/app-builder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject._id,
          prompt,
          model: selectedModel,
          provider: selectedProvider,
        }),
      });

      const data = await response.json();
      if (data.code) {
        setGeneratedCode(data.code);
        await fetchProjects(); // Refresh to get updated credits
        alert(`Code generated! Used ${data.credits} credits (${data.tokens} tokens)`);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error generating code:', error);
      alert('Failed to generate code. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <VerificationBanner />
        
        {settings && !settings.enabled && (
          <div className="bg-yellow-500 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 px-4 py-3 mb-4 rounded-lg border border-yellow-600 dark:border-yellow-700">
            <p className="font-semibold">App Builder Requests Currently Full</p>
            <p className="text-sm">
              We're currently at capacity. Please subscribe to be notified when availability opens for new app creation requests.
            </p>
          </div>
        )}

        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">App Builder</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Build apps with AI assistance and professional developer oversight. You can build all types of applications - web apps, mobile apps, desktop applications, APIs, and more!
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/sites/app-builder/dashboard"
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Dashboard
            </Link>
            <Link
              href="/sites/app-builder/onboarding"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              How It Works
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Credit Balance */}
          <div className="lg:col-span-1">
            <CreditBalance />
          </div>

          {/* Quote Calculator */}
          <div className="lg:col-span-2">
            <QuoteCalculator />
          </div>
        </div>

        {/* Questionnaire or Projects Section */}
        {showQuestionnaire ? (
          <ProjectQuestionnaire
            onComplete={handleQuestionnaireComplete}
            onCancel={() => setShowQuestionnaire(false)}
          />
        ) : (
          <>
            {/* Projects Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Your Projects</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQuestionnaire(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Start Questionnaire
                  </button>
                  <button
                    onClick={() => setShowNewProject(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    disabled={!userVerified || (settings && !settings.enabled)}
                  >
                    New Project
                  </button>
                </div>
              </div>

              {showNewProject && (
                <NewProjectForm
                  onCreate={createProject}
                  onCancel={() => setShowNewProject(false)}
                />
              )}

          {projects.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No projects yet. Create your first project to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => setSelectedProject(project)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedProject?._id === project._id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{project.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {project.description.substring(0, 100)}...
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                          {project.appType}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                          {project.paymentType}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        {project.creditsUsed} credits
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {project.tokensUsed} tokens
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Code Generation Section */}
        {selectedProject && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Generate Code for: {selectedProject.title}
            </h2>

            <div className="space-y-4">
              <ModelSelector
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
                onSelect={(provider, model) => {
                  setSelectedProvider(provider);
                  setSelectedModel(model);
                }}
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Describe what you want to build
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Create a React component for a user login form with email and password fields..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[120px]"
                />
              </div>

              <button
                onClick={generateCode}
                disabled={generating || !prompt || !selectedProvider || !selectedModel}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  generating || !prompt || !selectedProvider || !selectedModel
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {generating ? 'Generating...' : 'Generate Code'}
              </button>

              {generatedCode && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Generated Code</label>
                  <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-x-auto text-sm">
                    <code>{generatedCode}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

function NewProjectForm({
  onCreate,
  onCancel,
}: {
  onCreate: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    appType: 'web',
    paymentType: 'credits' as 'per_hour' | 'per_project' | 'subscription' | 'credits',
    requirements: '',
    termsAccepted: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      alert('Please accept the terms of service');
      return;
    }
    onCreate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-2">Project Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">App Type</label>
          <select
            value={formData.appType}
            onChange={(e) => setFormData({ ...formData, appType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="web">Web App</option>
            <option value="mobile">Mobile App</option>
            <option value="desktop">Desktop App</option>
            <option value="api">API/Backend</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Payment Type</label>
          <select
            value={formData.paymentType}
            onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="credits">Credits</option>
            <option value="per_hour">Per Hour</option>
            <option value="per_project">Per Project</option>
            <option value="subscription">Subscription</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Requirements (Optional)</label>
        <textarea
          value={formData.requirements}
          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[80px]"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="terms"
          checked={formData.termsAccepted}
          onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="terms" className="text-sm">
          I accept the Terms of Service
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create Project
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
