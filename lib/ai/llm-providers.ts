// Multi-provider LLM service

export type LLMProvider = 'ollama' | 'openai' | 'anthropic' | 'google' | 'none';

export interface LLMConfig {
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
}

export interface LLMResponse {
  content: string;
  tokens?: number;
  error?: string;
}

export interface LLMGenerateOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

class LLMProviderService {
  async generate(
    config: LLMConfig,
    prompt: string,
    options: LLMGenerateOptions = {}
  ): Promise<LLMResponse> {
    if (!config.enabled || config.provider === 'none') {
      return {
        content: '',
        error: 'LLM is not enabled or configured',
      };
    }

    try {
      switch (config.provider) {
        case 'ollama':
          return await this.callOllama(config, prompt, options);
        case 'openai':
          return await this.callOpenAI(config, prompt, options);
        case 'anthropic':
          return await this.callAnthropic(config, prompt, options);
        case 'google':
          return await this.callGoogle(config, prompt, options);
        default:
          return {
            content: '',
            error: `Unsupported LLM provider: ${config.provider}`,
          };
      }
    } catch (error: any) {
      return {
        content: '',
        error: error.message || 'LLM generation failed',
      };
    }
  }

  private async callOllama(
    config: LLMConfig,
    prompt: string,
    options: LLMGenerateOptions
  ): Promise<LLMResponse> {
    const baseUrl = config.ollamaBaseUrl || 'http://localhost:11434';
    const model = config.ollamaModel || 'llama3.2';

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      const requestBody = {
        model,
        prompt: options.systemPrompt ? `${options.systemPrompt}\n\n${prompt}` : prompt,
        stream: false,
        options: {
          num_predict: options.maxTokens || config.defaultMaxTokens || 2000,
          temperature: options.temperature ?? config.defaultTemperature ?? 0.7,
        },
      };

      console.log(`[Ollama] Calling ${baseUrl}/api/generate with model: ${model}`);

      try {
        const response = await fetch(`${baseUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log(`[Ollama] Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          // Try to get error details from response
          let errorMessage = `Ollama API error: ${response.status} ${response.statusText}`;
          let errorDetails: any = null;
          
          try {
            const errorText = await response.text();
            console.error(`[Ollama] Error response body:`, errorText);
            
            try {
              errorDetails = JSON.parse(errorText);
              if (errorDetails.error) {
                errorMessage = `Ollama API error: ${errorDetails.error}`;
              }
            } catch {
              // If not JSON, use the text as error message
              if (errorText) {
                errorMessage = `Ollama API error: ${errorText.substring(0, 200)}`;
              }
            }
          } catch (parseError) {
            console.error('[Ollama] Failed to parse error response:', parseError);
          }
          
          // Check for common errors
          if (response.status === 404) {
            return {
              content: '',
              error: `Model "${model}" not found. Please pull the model first: ollama pull ${model}`,
            };
          }
          
          if (response.status === 500) {
            // Internal Server Error from Ollama - could be model not loaded, out of memory, etc.
            return {
              content: '',
              error: `Ollama server error. This usually means:\n1. The model "${model}" is not loaded - try: ollama pull ${model}\n2. Ollama is out of memory\n3. The model is corrupted\n\nError details: ${errorMessage}`,
            };
          }
          
          return {
            content: '',
            error: errorMessage,
          };
        }

        const data = await response.json();
        console.log(`[Ollama] Success - received ${data.response?.length || 0} characters`);

        // Check if Ollama returned an error in the response
        if (data.error) {
          console.error(`[Ollama] Error in response:`, data.error);
          return {
            content: '',
            error: `Ollama error: ${data.error}`,
          };
        }

        if (!data.response) {
          return {
            content: '',
            error: 'Ollama returned an empty response. The model may not be loaded or there was an issue processing the request.',
          };
        }

        return {
          content: data.response || '',
          tokens: data.eval_count,
        };
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          return {
            content: '',
            error: 'Request timeout. The model may be too slow or the prompt too long. Try reducing max tokens or using a faster model.',
          };
        }
        throw fetchError;
      }
    } catch (error: any) {
      // Handle network errors
      if (error.message?.includes('fetch failed') || 
          error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('ENOTFOUND') ||
          error.code === 'ECONNREFUSED') {
        return {
          content: '',
          error: `Cannot connect to Ollama at ${baseUrl}. Please ensure Ollama is running and the base URL is correct.`,
        };
      }
      
      // Return the error message
      return {
        content: '',
        error: error.message || 'Ollama API request failed',
      };
    }
  }

  private async callOpenAI(
    config: LLMConfig,
    prompt: string,
    options: LLMGenerateOptions
  ): Promise<LLMResponse> {
    const apiKey = config.openaiApiKey;
    if (!apiKey) {
      return {
        content: '',
        error: 'OpenAI API key is not configured',
      };
    }

    const baseUrl = config.openaiBaseUrl || 'https://api.openai.com/v1';
    const model = config.openaiModel || 'gpt-4o-mini';

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
          max_tokens: options.maxTokens || config.defaultMaxTokens || 2000,
          temperature: options.temperature ?? config.defaultTemperature ?? 0.7,
        }),
      });

      if (!response.ok) {
        let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = `OpenAI API error: ${errorData.error.message}`;
          }
        } catch {
          // If we can't parse the error, use the status text
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('OpenAI returned an empty response');
      }

      return {
        content: data.choices[0].message.content,
        tokens: data.usage?.total_tokens,
      };
    } catch (error: any) {
      // Handle network errors
      if (error.message?.includes('fetch failed') || 
          error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('ENOTFOUND')) {
        return {
          content: '',
          error: `Cannot connect to OpenAI API. Please check your API key and network connection.`,
        };
      }
      return {
        content: '',
        error: error.message || 'OpenAI API request failed',
      };
    }
  }

  private async callAnthropic(
    config: LLMConfig,
    prompt: string,
    options: LLMGenerateOptions
  ): Promise<LLMResponse> {
    const apiKey = config.anthropicApiKey;
    if (!apiKey) {
      return {
        content: '',
        error: 'Anthropic API key is not configured',
      };
    }

    const model = config.anthropicModel || 'claude-3-5-sonnet-20241022';

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: options.maxTokens || config.defaultMaxTokens || 2000,
          temperature: options.temperature ?? config.defaultTemperature ?? 0.7,
          messages: [
            {
              role: 'user',
              content: options.systemPrompt
                ? `${options.systemPrompt}\n\n${prompt}`
                : prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        let errorMessage = `Anthropic API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = `Anthropic API error: ${errorData.error.message}`;
          }
        } catch {
          // If we can't parse the error, use the status text
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.content || !data.content[0]?.text) {
        throw new Error('Anthropic returned an empty response');
      }

      return {
        content: data.content[0].text,
        tokens: data.usage?.input_tokens && data.usage?.output_tokens
          ? data.usage.input_tokens + data.usage.output_tokens
          : undefined,
      };
    } catch (error: any) {
      // Handle network errors
      if (error.message?.includes('fetch failed') || 
          error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('ENOTFOUND')) {
        return {
          content: '',
          error: `Cannot connect to Anthropic API. Please check your API key and network connection.`,
        };
      }
      return {
        content: '',
        error: error.message || 'Anthropic API request failed',
      };
    }
  }

  private async callGoogle(
    config: LLMConfig,
    prompt: string,
    options: LLMGenerateOptions
  ): Promise<LLMResponse> {
    const apiKey = config.googleApiKey;
    if (!apiKey) {
      return {
        content: '',
        error: 'Google API key is not configured',
      };
    }

    let model = config.googleModel || 'gemini-1.5-flash';
    // Ensure model name doesn't have "models/" prefix
    if (model.startsWith('models/')) {
      model = model.replace('models/', '');
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: options.systemPrompt
                    ? `${options.systemPrompt}\n\n${prompt}`
                    : prompt,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: options.maxTokens || config.defaultMaxTokens || 2000,
            temperature: options.temperature ?? config.defaultTemperature ?? 0.7,
          },
        }),
      });

      if (!response.ok) {
        let errorMessage = `Google API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = `Google API error: ${errorData.error.message}`;
          } else if (errorData.error) {
            errorMessage = `Google API error: ${JSON.stringify(errorData.error)}`;
          }
        } catch {
          // If we can't parse the error, use the status text
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        // Check for safety ratings blocking the response
        if (data.candidates?.[0]?.finishReason === 'SAFETY') {
          throw new Error('Google API blocked the response due to safety filters');
        }
        throw new Error('Google returned an empty response');
      }

      return {
        content: data.candidates[0].content.parts[0].text,
        tokens: data.usageMetadata?.totalTokenCount,
      };
    } catch (error: any) {
      // Handle network errors
      if (error.message?.includes('fetch failed') || 
          error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('ENOTFOUND')) {
        return {
          content: '',
          error: `Cannot connect to Google API. Please check your API key and network connection.`,
        };
      }
      return {
        content: '',
        error: error.message || 'Google API request failed',
      };
    }
  }

  async checkAvailability(config: LLMConfig): Promise<boolean> {
    if (!config.enabled || config.provider === 'none') {
      return false;
    }

    try {
      switch (config.provider) {
        case 'ollama':
          const baseUrl = config.ollamaBaseUrl || 'http://localhost:11434';
          const response = await fetch(`${baseUrl}/api/tags`, { method: 'GET' });
          return response.ok;
        case 'openai':
          if (!config.openaiApiKey) return false;
          // Test with a simple API call
          try {
            const baseUrl = config.openaiBaseUrl || 'https://api.openai.com/v1';
            const testResponse = await fetch(`${baseUrl}/models`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${config.openaiApiKey}`,
                'Content-Type': 'application/json',
              },
            });
            return testResponse.ok;
          } catch {
            return false;
          }
        case 'anthropic':
          if (!config.anthropicApiKey) return false;
          // Test with a simple API call
          try {
            const testResponse = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.anthropicApiKey,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: config.anthropicModel || 'claude-3-5-sonnet-20241022',
                max_tokens: 10,
                messages: [{ role: 'user', content: 'test' }],
              }),
            });
            // 400 is OK (it means auth worked, just bad request), 401/403 means auth failed
            return testResponse.status !== 401 && testResponse.status !== 403;
          } catch {
            return false;
          }
        case 'google':
          if (!config.googleApiKey) return false;
          // Test with a simple API call - try to list models
          try {
            const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${config.googleApiKey}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            return testResponse.ok;
          } catch {
            return false;
          }
        default:
          return false;
      }
    } catch {
      return false;
    }
  }
}

export const llmProviderService = new LLMProviderService();

