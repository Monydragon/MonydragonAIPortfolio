"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [status, setStatus] = useState<{ 
    available: boolean; 
    status?: 'success' | 'warning' | 'failed';
    message?: string;
    provider?: string;
    model?: string;
    details?: any;
  } | null>(null);
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string; description?: string }>>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [libraryModels, setLibraryModels] = useState<Array<{ 
    id: string; 
    name: string; 
    description?: string; 
    size?: string; 
    sizeBytes?: number;
    sizeCategory?: string;
    tags?: string[]; 
    installed?: boolean;
    lastUpdated?: string;
    parameters?: string;
    family?: string;
  }>>([]);
  const [libraryFilters, setLibraryFilters] = useState<{
    tags?: string[];
    sizeCategories?: Array<{ value: string; label: string }>;
  }>({});
  const [libraryStats, setLibraryStats] = useState<{ total: number; filtered: number }>({ total: 0, filtered: 0 });
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [diskSpace, setDiskSpace] = useState<any>(null);
  const [loadingDiskSpace, setLoadingDiskSpace] = useState(false);
  const [pullingModel, setPullingModel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [activeTab, setActiveTab] = useState<"general" | "ollama" | "openai" | "anthropic" | "google" | "settings">("general");

  useEffect(() => {
    fetchConfig();
    checkStatus();
    fetchDiskSpace();
  }, []);

  useEffect(() => {
    if (config.provider === "ollama") {
      fetchLibraryModels();
      fetchDiskSpace();
    }
  }, [config.provider]);

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

  const fetchDiskSpace = async () => {
    if (config.provider !== "ollama") return;
    setLoadingDiskSpace(true);
    try {
      const response = await fetch("/api/llm/disk-space");
      if (response.ok) {
        const data = await response.json();
        setDiskSpace(data);
      }
    } catch (error) {
      console.error("Error fetching disk space:", error);
    } finally {
      setLoadingDiskSpace(false);
    }
  };

  const fetchLibraryModels = async () => {
    setLoadingLibrary(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (sizeFilter !== "all") params.append("size", sizeFilter);
      if (tagFilter !== "all") params.append("tag", tagFilter);
      if (sortBy) params.append("sort", sortBy);

      const response = await fetch(`/api/llm/models/library?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLibraryModels(data.models || []);
        setLibraryFilters(data.filters || {});
        setLibraryStats({ total: data.total || 0, filtered: data.filtered || 0 });
      }
    } catch (error) {
      console.error("Error fetching library models:", error);
    } finally {
      setLoadingLibrary(false);
    }
  };

  // Debounced search and filter updates - auto-fetch when Ollama tab is active
  useEffect(() => {
    if (activeTab === "ollama") {
      const timer = setTimeout(() => {
        fetchLibraryModels();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sizeFilter, tagFilter, sortBy, activeTab]);

  const handlePullModel = async (modelName: string) => {
    if (!confirm(`Download model "${modelName}"? This may take several minutes and use significant disk space.`)) {
      return;
    }

    setPullingModel(modelName);
    try {
      const response = await fetch("/api/llm/models/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelName,
          ollamaBaseUrl: config.ollamaBaseUrl,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`✅ ${data.message}\n\nYou can check the status by refreshing the models list.`);
        // Refresh models and disk space after a delay
        setTimeout(() => {
          fetchAvailableModels("ollama");
          fetchLibraryModels();
          fetchDiskSpace();
        }, 2000);
      } else {
        alert(`❌ Failed to pull model: ${data.error}`);
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setPullingModel(null);
    }
  };

  const handleRemoveModel = async (modelName: string) => {
    if (!confirm(`Remove model "${modelName}"? This will free up disk space but you'll need to download it again to use it.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/llm/models/remove?modelName=${encodeURIComponent(modelName)}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok) {
        alert(`✅ ${data.message}`);
        // Refresh models and disk space
        fetchAvailableModels("ollama");
        if (activeTab === "ollama") {
          fetchLibraryModels();
        }
        fetchDiskSpace();
      } else {
        alert(`❌ Failed to remove model: ${data.error}`);
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const fetchAvailableModels = useCallback(async (provider: LLMProvider) => {
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
  }, [config.ollamaBaseUrl, config.openaiApiKey, config.googleApiKey]);

  // Fetch available models when provider or API keys change
  useEffect(() => {
    if (config.provider && config.provider !== "none") {
      fetchAvailableModels(config.provider);
    } else {
      setAvailableModels([]);
    }
  }, [config.provider, fetchAvailableModels]);

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

      <main className="container mx-auto px-4 py-12 max-w-6xl" style={{ overflow: 'visible' }}>
        <div className="space-y-6" style={{ overflow: 'visible' }}>
          {/* Status Banner */}
          {status && (
            <AnimatedCard>
              <div className={`p-4 rounded-lg ${
                status.status === 'success' 
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" 
                  : status.status === 'warning'
                  ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`text-2xl ${
                      status.status === 'success' 
                        ? "text-green-600 dark:text-green-400" 
                        : status.status === 'warning'
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {status.status === 'success' ? "✓" : status.status === 'warning' ? "⚠" : "✕"}
                    </div>
                    <div>
                      <p className={`font-semibold ${
                        status.status === 'success' 
                          ? "text-green-900 dark:text-green-200" 
                          : status.status === 'warning'
                          ? "text-amber-900 dark:text-amber-200"
                          : "text-red-900 dark:text-red-200"
                      }`}>
                        {status.status === 'success' 
                          ? "Connected" 
                          : status.status === 'warning'
                          ? "Warning"
                          : "Connection Failed"}
                      </p>
                      <p className={`text-sm mt-1 ${
                        status.status === 'success' 
                          ? "text-green-800 dark:text-green-300" 
                          : status.status === 'warning'
                          ? "text-amber-800 dark:text-amber-300"
                          : "text-red-800 dark:text-red-300"
                      }`}>
                        {status.message}
                      </p>
                      {status.details && status.provider === 'ollama' && (
                        <div className="mt-2 text-xs space-y-1">
                          {status.details.modelCount !== undefined && (
                            <p className={status.status === 'success' ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}>
                              Models available: {status.details.modelCount}
                            </p>
                          )}
                          {status.details.configuredModel && (
                            <p className={status.details.modelAvailable ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}>
                              Configured model "{status.details.configuredModel}": {status.details.modelAvailable ? "Available" : "Not found - run: ollama pull " + status.details.configuredModel}
                            </p>
                          )}
                          {status.details.baseUrl && (
                            <p className="text-gray-600 dark:text-gray-400">
                              Base URL: {status.details.baseUrl}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
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

          {/* Tab Navigation */}
          <AnimatedCard>
            <div className="border-b border-gray-200 dark:border-gray-800">
              <nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("general")}
                  className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === "general"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  General
                </button>
                <button
                  onClick={() => {
                    setActiveTab("ollama");
                    if (config.provider !== "ollama") {
                      setConfig({ ...config, provider: "ollama" });
                    }
                  }}
                  className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === "ollama"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  Ollama
                </button>
                <button
                  onClick={() => {
                    setActiveTab("openai");
                    if (config.provider !== "openai") {
                      setConfig({ ...config, provider: "openai" });
                    }
                  }}
                  className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === "openai"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  OpenAI
                </button>
                <button
                  onClick={() => {
                    setActiveTab("anthropic");
                    if (config.provider !== "anthropic") {
                      setConfig({ ...config, provider: "anthropic" });
                    }
                  }}
                  className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === "anthropic"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  Anthropic
                </button>
                <button
                  onClick={() => {
                    setActiveTab("google");
                    if (config.provider !== "google") {
                      setConfig({ ...config, provider: "google" });
                    }
                  }}
                  className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === "google"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  Google
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === "settings"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>
          </AnimatedCard>

          {/* General Tab - Provider Selection */}
          {activeTab === "general" && (
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
                    onChange={(e) => {
                      const newProvider = e.target.value as LLMProvider;
                      setConfig({ ...config, provider: newProvider });
                      // Switch to the appropriate tab
                      if (newProvider === "ollama") setActiveTab("ollama");
                      else if (newProvider === "openai") setActiveTab("openai");
                      else if (newProvider === "anthropic") setActiveTab("anthropic");
                      else if (newProvider === "google") setActiveTab("google");
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  >
                    <option value="none">None (Disabled)</option>
                    <option value="ollama">Ollama (Local)</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="google">Google (Gemini)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select a provider and configure it in its dedicated tab above.
                  </p>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Ollama Tab */}
          {activeTab === "ollama" && (
            <div className="space-y-6">
              <AnimatedCard>
                <h2 className="text-xl font-bold mb-4">Ollama Configuration</h2>
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

                {/* Disk Space Information */}
                {diskSpace && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold">Disk Space</h3>
                      <button
                        onClick={fetchDiskSpace}
                        disabled={loadingDiskSpace}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {loadingDiskSpace ? "Loading..." : "Refresh"}
                      </button>
                    </div>
                    {diskSpace.containerRunning ? (
                      diskSpace.hasDiskInfo ? (
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Used:</span>
                            <span className="font-medium">{diskSpace.used} / {diskSpace.size}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Available:</span>
                            <span className="font-medium">{diskSpace.available}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Usage:</span>
                            <span className={`font-medium ${
                              parseInt(diskSpace.usePercent) > 80 ? "text-red-600" :
                              parseInt(diskSpace.usePercent) > 60 ? "text-amber-600" :
                              "text-green-600"
                            }`}>
                              {diskSpace.usePercent}
                            </span>
                          </div>
                          {diskSpace.volume && (
                            <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-700">
                              <p className="text-gray-500 dark:text-gray-500 text-xs">Volume: {diskSpace.volume.size} total</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Disk space information unavailable</p>
                      )
                    ) : (
                      <p className="text-xs text-amber-600">Container is not running</p>
                    )}
                  </div>
                )}

              </div>
              </AnimatedCard>

              {/* Model Browser - Always visible in Ollama tab */}
              <AnimatedCard>
                <h2 className="text-xl font-bold mb-4">Model Browser</h2>
                <div className="space-y-3">
                  {/* Search and Filters */}
                  <div className="space-y-2">
                    {/* Search Bar */}
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search models by name, description, or tags..."
                        className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                      />
                      <svg
                        className="absolute right-3 top-2.5 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-wrap gap-2">
                      {/* Size Filter */}
                      <select
                        value={sizeFilter}
                        onChange={(e) => setSizeFilter(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                      >
                        <option value="all">All Sizes</option>
                        {libraryFilters.sizeCategories?.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>

                      {/* Tag Filter */}
                      <select
                        value={tagFilter}
                        onChange={(e) => setTagFilter(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                      >
                        <option value="all">All Tags</option>
                        {libraryFilters.tags?.map((tag) => (
                          <option key={tag} value={tag}>
                            {tag.charAt(0).toUpperCase() + tag.slice(1)}
                          </option>
                        ))}
                      </select>

                      {/* Sort By */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                      >
                        <option value="name">Sort: Name</option>
                        <option value="size">Sort: Size (Small to Large)</option>
                        <option value="size-desc">Sort: Size (Large to Small)</option>
                        <option value="updated">Sort: Recently Updated</option>
                        <option value="updated-asc">Sort: Oldest First</option>
                      </select>

                      {/* Results Count */}
                      <div className="ml-auto flex items-center gap-2">
                        {(searchQuery || sizeFilter !== "all" || tagFilter !== "all") && (
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setSizeFilter("all");
                              setTagFilter("all");
                              setSortBy("name");
                            }}
                            className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                          >
                            Clear Filters
                          </button>
                        )}
                        {libraryStats.filtered > 0 && (
                          <span className="text-xs text-gray-500">
                            Showing {libraryStats.filtered} of {libraryStats.total} models
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Models List */}
                  <div className="max-h-[600px] overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-lg">
                    {loadingLibrary ? (
                      <div className="p-4 text-center text-sm text-gray-500">Loading models...</div>
                    ) : libraryModels.length > 0 ? (
                      <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {libraryModels.map((model) => (
                          <div
                            key={model.id}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm">{model.name}</span>
                                  {model.installed && (
                                    <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                                      Installed
                                    </span>
                                  )}
                                  {model.parameters && (
                                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                      {model.parameters}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {model.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs text-gray-500">Size: {model.size}</span>
                                  {model.lastUpdated && (
                                    <span className="text-xs text-gray-500">
                                      Updated: {new Date(model.lastUpdated).toLocaleDateString()}
                                    </span>
                                  )}
                                  {model.family && (
                                    <span className="text-xs text-gray-500">Family: {model.family}</span>
                                  )}
                                  {model.tags && model.tags.length > 0 && (
                                    <div className="flex gap-1 flex-wrap">
                                      {model.tags.slice(0, 4).map((tag) => (
                                        <span
                                          key={tag}
                                          className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                      {model.tags.length > 4 && (
                                        <span className="text-xs text-gray-400">+{model.tags.length - 4}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                {model.installed ? (
                                  <button
                                    onClick={() => handleRemoveModel(model.name)}
                                    className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
                                  >
                                    Remove
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handlePullModel(model.name)}
                                    disabled={pullingModel === model.name}
                                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50"
                                  >
                                    {pullingModel === model.name ? "Downloading..." : "Download"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        {searchQuery || sizeFilter !== "all" || tagFilter !== "all" 
                          ? "No models match your filters. Try adjusting your search or filters."
                          : "No models found"}
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            </div>
          )}

          {/* OpenAI Tab */}
          {activeTab === "openai" && (
            <AnimatedCard>
              <h2 className="text-xl font-bold mb-4">OpenAI Configuration</h2>
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

          {/* Anthropic Tab */}
          {activeTab === "anthropic" && (
            <AnimatedCard>
              <h2 className="text-xl font-bold mb-4">Anthropic (Claude) Configuration</h2>
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

          {/* Google Tab */}
          {activeTab === "google" && (
            <AnimatedCard>
              <h2 className="text-xl font-bold mb-4">Google (Gemini) Configuration</h2>
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

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
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
          )}
        </div>
      </main>
    </div>
  );
}

