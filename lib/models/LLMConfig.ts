import mongoose, { Schema, Document, Model } from 'mongoose';

export type LLMProvider = 'ollama' | 'openai' | 'anthropic' | 'google' | 'none';

export interface ILLMConfig extends Document {
  provider: LLMProvider;
  enabled: boolean;
  
  // Ollama settings
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  
  // OpenAI settings
  openaiApiKey?: string;
  openaiModel?: string;
  openaiBaseUrl?: string;
  
  // Anthropic (Claude) settings
  anthropicApiKey?: string;
  anthropicModel?: string;
  
  // Google (Gemini) settings
  googleApiKey?: string;
  googleModel?: string;
  
  // General settings
  defaultMaxTokens?: number;
  defaultTemperature?: number;
  
  // Custom prompts
  customPrompts?: {
    blogGeneration?: string;
    blogImprovement?: string;
    excerptGeneration?: string;
    tagGeneration?: string;
  };
  
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LLMConfigSchema = new Schema<ILLMConfig>(
  {
    provider: {
      type: String,
      enum: ['ollama', 'openai', 'anthropic', 'google', 'none'],
      default: 'none',
      required: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    ollamaBaseUrl: {
      type: String,
      default: 'http://localhost:11434',
    },
    ollamaModel: {
      type: String,
      default: 'llama3.2',
    },
    openaiApiKey: {
      type: String,
    },
    openaiModel: {
      type: String,
      default: 'gpt-4o-mini',
    },
    openaiBaseUrl: {
      type: String,
      default: 'https://api.openai.com/v1',
    },
    anthropicApiKey: {
      type: String,
    },
    anthropicModel: {
      type: String,
      default: 'claude-3-5-sonnet-20241022',
    },
    googleApiKey: {
      type: String,
    },
    googleModel: {
      type: String,
      default: 'gemini-1.5-flash',
    },
    defaultMaxTokens: {
      type: Number,
      default: 2000,
    },
    defaultTemperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2,
    },
    customPrompts: {
      blogGeneration: String,
      blogImprovement: String,
      excerptGeneration: String,
      tagGeneration: String,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Only allow one LLM config document
LLMConfigSchema.index({}, { unique: true });

const LLMConfig: Model<ILLMConfig> = mongoose.models.LLMConfig || mongoose.model<ILLMConfig>('LLMConfig', LLMConfigSchema);

export default LLMConfig;

