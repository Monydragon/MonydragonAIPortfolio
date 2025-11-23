'use client';

import { useState, useEffect } from 'react';

interface LLMConfig {
  provider: string;
  enabled: boolean;
  ollamaModel?: string;
  openaiModel?: string;
  anthropicModel?: string;
  googleModel?: string;
  hasOpenAIKey?: boolean;
  hasAnthropicKey?: boolean;
  hasGoogleKey?: boolean;
}

interface ModelOption {
  provider: string;
  model: string;
  label: string;
  description: string;
  available: boolean;
}

export default function ModelSelector({
  selectedProvider,
  selectedModel,
  onSelect,
}: {
  selectedProvider?: string;
  selectedModel?: string;
  onSelect: (provider: string, model: string) => void;
}) {
  const [config, setConfig] = useState<LLMConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/llm/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching LLM config:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableModels = (): ModelOption[] => {
    if (!config) return [];

    const models: ModelOption[] = [];

    // Local/Ollama models (always available if Ollama is configured)
    if (config.provider === 'ollama' || config.enabled) {
      models.push({
        provider: 'ollama',
        model: config.ollamaModel || 'llama3.2',
        label: `Ollama: ${config.ollamaModel || 'llama3.2'}`,
        description: 'Local model - Free to use',
        available: true,
      });
      models.push({
        provider: 'local',
        model: config.ollamaModel || 'llama3.2',
        label: `Local: ${config.ollamaModel || 'llama3.2'}`,
        description: 'Local model - Free to use',
        available: true,
      });
    }

    // OpenAI models
    if (config.hasOpenAIKey) {
      models.push({
        provider: 'openai',
        model: config.openaiModel || 'gpt-4o-mini',
        label: `OpenAI: ${config.openaiModel || 'gpt-4o-mini'}`,
        description: 'GPT models - Premium quality',
        available: true,
      });
      models.push({
        provider: 'openai',
        model: 'gpt-4',
        label: 'OpenAI: GPT-4',
        description: 'GPT-4 - Highest quality',
        available: true,
      });
      models.push({
        provider: 'openai',
        model: 'gpt-4-turbo',
        label: 'OpenAI: GPT-4 Turbo',
        description: 'GPT-4 Turbo - Fast and powerful',
        available: true,
      });
    }

    // Anthropic (Claude) models
    if (config.hasAnthropicKey) {
      models.push({
        provider: 'anthropic',
        model: config.anthropicModel || 'claude-3-5-sonnet-20241022',
        label: `Claude: ${config.anthropicModel || 'claude-3-5-sonnet-20241022'}`,
        description: 'Claude Sonnet - Excellent for code generation',
        available: true,
      });
      models.push({
        provider: 'anthropic',
        model: 'claude-3-opus-20240229',
        label: 'Claude: Opus',
        description: 'Claude Opus - Most powerful',
        available: true,
      });
    }

    // Google models
    if (config.hasGoogleKey) {
      models.push({
        provider: 'google',
        model: config.googleModel || 'gemini-1.5-flash',
        label: `Google: ${config.googleModel || 'gemini-1.5-flash'}`,
        description: 'Gemini - Fast and efficient',
        available: true,
      });
    }

    return models;
  };

  const models = getAvailableModels();

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-600 dark:text-gray-400">
        Loading models...
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          No LLM models are configured. Please configure LLM settings in the admin panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium mb-2">Select AI Model</label>
      <div className="space-y-2">
        {models.map((model) => (
          <button
            key={`${model.provider}-${model.model}`}
            onClick={() => onSelect(model.provider, model.model)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
              selectedProvider === model.provider && selectedModel === model.model
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{model.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{model.description}</p>
              </div>
              {selectedProvider === model.provider && selectedModel === model.model && (
                <span className="text-blue-500">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

