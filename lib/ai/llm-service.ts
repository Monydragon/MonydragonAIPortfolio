// Local LLM Service - Supports Ollama and other local LLM providers

export interface LLMConfig {
  provider: 'ollama' | 'local';
  baseUrl?: string;
  model?: string;
}

export interface LLMResponse {
  content: string;
  tokens?: number;
  error?: string;
}

class LLMService {
  private config: LLMConfig;

  constructor(config: LLMConfig = { provider: 'ollama', model: 'llama3.2' }) {
    this.config = {
      provider: config.provider || 'ollama',
      baseUrl: config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: config.model || process.env.OLLAMA_MODEL || 'llama3.2',
    };
  }

  async generate(prompt: string, options?: { maxTokens?: number; temperature?: number }): Promise<LLMResponse> {
    try {
      if (this.config.provider === 'ollama') {
        return await this.callOllama(prompt, options);
      }
      
      throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
    } catch (error: any) {
      return {
        content: '',
        error: error.message || 'LLM generation failed',
      };
    }
  }

  private async callOllama(prompt: string, options?: { maxTokens?: number; temperature?: number }): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          stream: false,
          options: {
            num_predict: options?.maxTokens || 2000,
            temperature: options?.temperature || 0.7,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.response || '',
        tokens: data.eval_count,
      };
    } catch (error: any) {
      // If Ollama is not available, return a helpful error
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        return {
          content: '',
          error: 'Local LLM service (Ollama) is not running. Please start Ollama or configure a different LLM provider.',
        };
      }
      throw error;
    }
  }

  async generateBlogPost(topic: string, style: string = 'professional'): Promise<LLMResponse> {
    const prompt = `Write a professional blog post about "${topic}" in a ${style} style. 
    
Requirements:
- Write in markdown format
- Include a compelling title
- Write an engaging introduction
- Include 3-5 main sections with headers
- Add a conclusion
- Use proper markdown formatting (headers, lists, code blocks where appropriate)
- Keep it informative and engaging
- Target length: 800-1200 words

Topic: ${topic}
Style: ${style}

Begin the blog post:`;

    return this.generate(prompt, { maxTokens: 2000, temperature: 0.8 });
  }

  async improveContent(content: string, instruction: string): Promise<LLMResponse> {
    const prompt = `Improve the following content based on this instruction: "${instruction}"

Original content:
${content}

Improved content:`;

    return this.generate(prompt, { maxTokens: 2000, temperature: 0.7 });
  }

  async generateExcerpt(content: string): Promise<LLMResponse> {
    const prompt = `Generate a concise, engaging excerpt (2-3 sentences, max 200 characters) for this blog post:

${content}

Excerpt:`;

    return this.generate(prompt, { maxTokens: 100, temperature: 0.5 });
  }

  async generateTags(content: string): Promise<LLMResponse> {
    const prompt = `Generate 5-8 relevant tags for this blog post content. Return only comma-separated tags, no explanation:

${content.substring(0, 1000)}

Tags:`;

    const response = await this.generate(prompt, { maxTokens: 50, temperature: 0.3 });
    
    if (response.content) {
      // Parse tags from response
      const tags = response.content
        .split(',')
        .map(tag => tag.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, ''))
        .filter(tag => tag.length > 0)
        .slice(0, 8);
      
      return {
        ...response,
        content: tags.join(', '),
      };
    }
    
    return response;
  }
}

// Singleton instance
export const llmService = new LLMService();

// Check if Ollama is available
export async function checkLLMAvailability(): Promise<boolean> {
  try {
    const config = {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    };
    
    const response = await fetch(`${config.baseUrl}/api/tags`, {
      method: 'GET',
    });
    
    return response.ok;
  } catch {
    return false;
  }
}

