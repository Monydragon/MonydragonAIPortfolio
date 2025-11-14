"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { ModelSelector } from "@/components/admin/ModelSelector";
import { motion } from "framer-motion";

type LLMProvider = "none" | "ollama" | "openai" | "anthropic" | "google";

interface LLMConfig {
  provider: LLMProvider;
  enabled: boolean;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  openaiApiKey?: string;
  openaiModel?: string;
  openaiBaseUrl?: string;
  anthropicApiKey?: string;
  anthropicModel?: string;
  googleApiKey?: string;
  googleModel?: string;
  defaultMaxTokens?: number;
  defaultTemperature?: number;
  customPrompts?: {
    blogGeneration?: string;
    blogImprovement?: string;
    excerptGeneration?: string;
    tagGeneration?: string;
  };
  hasOpenAIKey?: boolean;
  hasAnthropicKey?: boolean;
  hasGoogleKey?: boolean;
}

export default function LLMConfigPage() {
  const router = useRouter();
  const [config, setConfig] = useState<LLMConfig>({
    provider: "none",
    enabled: false,
    ollamaBaseUrl: "http://localhost:11434",
    ollamaModel: "llama3.2",
    openaiModel: "gpt-4o-mini",
    anthropicModel: "claude-3-5-sonnet-20241022",
    googleModel: "gemini-1.5-flash",
    defaultMaxTokens: 2000,
    defaultTemperature: 0.7,
    customPrompts: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ available: boolean; message?: string } | null>(null);
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string; description?: string }>>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    fetchConfig();
    checkStatus();
  }, []);

  // Fetch available models when provider or API keys change
  useEffect(() => {
    if (config.provider && config.provider !== "none") {
      fetchAvailableModels(config.provider);
    } else {
      setAvailableModels([]);
    }
  }, [config.provider, config.ollamaBaseUrl, config.openaiApiKey, config.anthropicApiKey, config.googleApiKey]); // Refetch when provider, base URL, or API keys change

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/llm/config");
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/llm/status");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  const fetchAvailableModels = async (provider: LLMProvider) => {
    setLoadingModels(true);
    try {
      let url = `/api/llm/models?provider=${provider}`;
      // For Ollama, include the base URL so we can fetch from the configured instance
      if (provider === "ollama" && config.ollamaBaseUrl) {
        url += `&ollamaBaseUrl=${encodeURIComponent(config.ollamaBaseUrl)}`;
      }
      // For OpenAI and Google, include the API key if available to fetch actual models
      if (provider === "openai" && config.openaiApiKey) {
        url += `&apiKey=${encodeURIComponent(config.openaiApiKey)}`;
      }
      if (provider === "google" && config.googleApiKey) {
        url += `&apiKey=${encodeURIComponent(config.googleApiKey)}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.models || []);
      } else {
        setAvailableModels([]);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      setAvailableModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/llm/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        alert("Configuration saved successfully!");
        await checkStatus();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save configuration");
      }
    } catch (error: any) {
      alert(error.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/MonyAdmin" className="text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LLM Configuration
              </h1>
            </div>
            <AnimatedButton onClick={handleSave} variant="primary" disabled={saving}>
              {saving ? "Saving..." : "Save Configuration"}
            </AnimatedButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl" style={{ overflow: 'visible' }}>
        <div className="space-y-6" style={{ overflow: 'visible' }}>
          {/* Status Banner */}
          {status && (
            <AnimatedCard>
              <div className={`p-4 rounded-lg ${status.available ? "bg-green-50 dark:bg-green-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {status.available ? "✓ LLM Available" : "⚠ LLM Unavailable"}
                    </p>
                    <p className="text-sm mt-1">{status.message}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/llm/test", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ prompt: "Say 'Test successful' and nothing else." }),
                          });
                          const data = await response.json();
                          if (data.success) {
                            alert(`✅ Test successful!\n\nResponse: ${data.response}\nProvider: ${data.provider}\nModel: ${data.model}`);
                          } else {
                            alert(`❌ Test failed!\n\nError: ${data.error}\n\nPlease check:\n- LLM configuration\n- Model availability\n- Network connectivity`);
                          }
                        } catch (error: any) {
                          alert(`❌ Test error: ${error.message}`);
                        }
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      Test Connection
                    </button>
                    <button
                      onClick={checkStatus}
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Provider Selection */}
          <AnimatedCard>
            <h2 className="text-xl font-bold mb-4">Provider Selection</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Enable LLM</span>
              </label>

              <div>
                <label className="block text-sm font-medium mb-2">Provider</label>
                <select
                  value={config.provider}
                  onChange={(e) => setConfig({ ...config, provider: e.target.value as LLMProvider })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  <option value="none">None (Disabled)</option>
                  <option value="ollama">Ollama (Local)</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="google">Google (Gemini)</option>
                </select>
              </div>
            </div>
          </AnimatedCard>

          {/* Ollama Settings */}
          {config.provider === "ollama" && (
            <AnimatedCard>
              <h2 className="text-xl font-bold mb-4">Ollama Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Base URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.ollamaBaseUrl || ""}
                      onChange={(e) => setConfig({ ...config, ollamaBaseUrl: e.target.value })}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                      placeholder="http://localhost:11434"
                    />
                    <button
                      type="button"
                      onClick={() => fetchAvailableModels("ollama")}
                      disabled={loadingModels}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 text-sm"
                    >
                      {loadingModels ? "..." : "Refresh"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Model</label>
                  <ModelSelector
                    models={availableModels}
                    selectedModel={config.ollamaModel || ""}
                    onSelect={(modelId) => setConfig({ ...config, ollamaModel: modelId })}
                    onRefresh={() => fetchAvailableModels("ollama")}
                    loading={loadingModels}
                    placeholder="Select a model..."
                    provider="Ollama"
                  />
                  {availableModels.length === 0 && !loadingModels && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={config.ollamaModel || ""}
                        onChange={(e) => setConfig({ ...config, ollamaModel: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                        placeholder="llama3.2"
                      />
                      <p className="text-xs text-gray-500 mt-1">Unable to fetch models. Enter model name manually or check Ollama connection.</p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* OpenAI Settings */}
          {config.provider === "openai" && (
            <AnimatedCard>
              <h2 className="text-xl font-bold mb-4">OpenAI Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">API Key</label>
                  <input
                    type="password"
                    value={config.openaiApiKey || ""}
                    onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                    placeholder={config.hasOpenAIKey ? "••••••••" : "sk-..."}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Model</label>
                  <ModelSelector
                    models={availableModels}
                    selectedModel={config.openaiModel || ""}
                    onSelect={(modelId) => setConfig({ ...config, openaiModel: modelId })}
                    onRefresh={() => fetchAvailableModels("openai")}
                    loading={loadingModels}
                    placeholder="Select a model..."
                    disabled={!config.openaiApiKey}
                    provider="OpenAI"
                  />
                  {availableModels.length === 0 && !loadingModels && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={config.openaiModel || ""}
                        onChange={(e) => setConfig({ ...config, openaiModel: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                        placeholder="gpt-4o-mini"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Base URL (Optional)</label>
                  <input
                    type="text"
                    value={config.openaiBaseUrl || ""}
                    onChange={(e) => setConfig({ ...config, openaiBaseUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                    placeholder="https://api.openai.com/v1"
                  />
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Anthropic Settings */}
          {config.provider === "anthropic" && (
            <AnimatedCard>
              <h2 className="text-xl font-bold mb-4">Anthropic (Claude) Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">API Key</label>
                  <input
                    type="password"
                    value={config.anthropicApiKey || ""}
                    onChange={(e) => setConfig({ ...config, anthropicApiKey: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                    placeholder={config.hasAnthropicKey ? "••••••••" : "sk-ant-..."}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Model</label>
                  <ModelSelector
                    models={availableModels}
                    selectedModel={config.anthropicModel || ""}
                    onSelect={(modelId) => setConfig({ ...config, anthropicModel: modelId })}
                    onRefresh={() => fetchAvailableModels("anthropic")}
                    loading={loadingModels}
                    placeholder="Select a model..."
                    disabled={!config.anthropicApiKey}
                    provider="Anthropic"
                  />
                  {availableModels.length === 0 && !loadingModels && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={config.anthropicModel || ""}
                        onChange={(e) => setConfig({ ...config, anthropicModel: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                        placeholder="claude-3-5-sonnet-20241022"
                      />
                    </div>
                  )}
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Google Settings */}
          {config.provider === "google" && (
            <AnimatedCard>
              <h2 className="text-xl font-bold mb-4">Google (Gemini) Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">API Key</label>
                  <input
                    type="password"
                    value={config.googleApiKey || ""}
                    onChange={(e) => setConfig({ ...config, googleApiKey: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                    placeholder={config.hasGoogleKey ? "••••••••" : "AIza..."}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Model</label>
                  <ModelSelector
                    models={availableModels}
                    selectedModel={config.googleModel || ""}
                    onSelect={(modelId) => setConfig({ ...config, googleModel: modelId })}
                    onRefresh={() => fetchAvailableModels("google")}
                    loading={loadingModels}
                    placeholder="Select a model..."
                    disabled={!config.googleApiKey}
                    provider="Google"
                  />
                  {availableModels.length === 0 && !loadingModels && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={config.googleModel || ""}
                        onChange={(e) => setConfig({ ...config, googleModel: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                        placeholder="gemini-1.5-flash"
                      />
                    </div>
                  )}
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* General Settings */}
          <AnimatedCard>
            <h2 className="text-xl font-bold mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Default Max Tokens: {config.defaultMaxTokens || 2000}</label>
                <input
                  type="range"
                  min="100"
                  max="4000"
                  step="100"
                  value={config.defaultMaxTokens || 2000}
                  onChange={(e) => setConfig({ ...config, defaultMaxTokens: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Default Temperature: {(config.defaultTemperature || 0.7).toFixed(1)}</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.defaultTemperature || 0.7}
                  onChange={(e) => setConfig({ ...config, defaultTemperature: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </AnimatedCard>

          {/* Custom Prompts */}
          <AnimatedCard>
            <h2 className="text-xl font-bold mb-4">Custom Prompts</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Blog Generation Prompt</label>
                <textarea
                  value={config.customPrompts?.blogGeneration || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      customPrompts: { ...config.customPrompts, blogGeneration: e.target.value },
                    })
                  }
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 font-mono text-sm"
                  placeholder='Use {{topic}} and {{style}} as placeholders. Example: "Write a blog post about {{topic}} in a {{style}} style..."'
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Blog Improvement Prompt</label>
                <textarea
                  value={config.customPrompts?.blogImprovement || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      customPrompts: { ...config.customPrompts, blogImprovement: e.target.value },
                    })
                  }
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 font-mono text-sm"
                  placeholder='Use {{content}} and {{instruction}} as placeholders.'
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Excerpt Generation Prompt</label>
                <textarea
                  value={config.customPrompts?.excerptGeneration || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      customPrompts: { ...config.customPrompts, excerptGeneration: e.target.value },
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 font-mono text-sm"
                  placeholder='Use {{content}} as placeholder.'
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tag Generation Prompt</label>
                <textarea
                  value={config.customPrompts?.tagGeneration || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      customPrompts: { ...config.customPrompts, tagGeneration: e.target.value },
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 font-mono text-sm"
                  placeholder='Use {{content}} as placeholder.'
                />
              </div>
            </div>
          </AnimatedCard>
        </div>
      </main>
    </div>
  );
}

