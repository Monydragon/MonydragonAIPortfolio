import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import AppBuilderProject from '@/lib/models/AppBuilderProject';
import User from '@/lib/models/User';
import LLMConfig from '@/lib/models/LLMConfig';
import { llmProviderService } from '@/lib/ai/llm-providers';
import creditService from '@/lib/services/credit-service';

// POST /api/app-builder/generate - Generate app code using LLM
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { projectId, prompt, model, provider } = body;

    if (!projectId || !prompt) {
      return NextResponse.json(
        { error: 'Missing projectId or prompt' },
        { status: 400 }
      );
    }

    const project = await AppBuilderProject.findOne({
      _id: projectId,
      userId: user._id,
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get LLM config
    const llmConfig = await LLMConfig.findOne();
    if (!llmConfig || !llmConfig.enabled) {
      return NextResponse.json(
        { error: 'LLM service is not configured or enabled' },
        { status: 400 }
      );
    }

    // Use provided model/provider or project defaults
    const selectedProvider = provider || project.modelProvider || llmConfig.provider;
    const selectedModel = model || project.selectedModel || 
      (selectedProvider === 'ollama' ? llmConfig.ollamaModel :
       selectedProvider === 'openai' ? llmConfig.openaiModel :
       selectedProvider === 'anthropic' ? llmConfig.anthropicModel :
       selectedProvider === 'google' ? llmConfig.googleModel : undefined);

    if (!selectedModel) {
      return NextResponse.json(
        { error: 'No model selected' },
        { status: 400 }
      );
    }

    // Create app generation prompt
    const systemPrompt = `You are an expert app developer with 20+ years of experience. 
Generate professional, production-ready code for app development. 
Follow best practices, include proper error handling, and write clean, maintainable code.
Provide complete, working solutions.`;

    const fullPrompt = `App Development Request:
Project: ${project.title}
Type: ${project.appType}
Description: ${project.description}
Features: ${project.features.join(', ')}
Requirements: ${project.requirements}

User Request: ${prompt}

Generate the complete code solution:`;

    // Prepare LLM config for generation
    const configForGeneration = {
      provider: selectedProvider as any,
      enabled: true,
      ollamaBaseUrl: llmConfig.ollamaBaseUrl,
      ollamaModel: selectedProvider === 'ollama' ? selectedModel : llmConfig.ollamaModel,
      openaiApiKey: llmConfig.openaiApiKey,
      openaiModel: selectedProvider === 'openai' ? selectedModel : llmConfig.openaiModel,
      openaiBaseUrl: llmConfig.openaiBaseUrl,
      anthropicApiKey: llmConfig.anthropicApiKey,
      anthropicModel: selectedProvider === 'anthropic' ? selectedModel : llmConfig.anthropicModel,
      googleApiKey: llmConfig.googleApiKey,
      googleModel: selectedProvider === 'google' ? selectedModel : llmConfig.googleModel,
      defaultMaxTokens: llmConfig.defaultMaxTokens || 4000,
      defaultTemperature: llmConfig.defaultTemperature || 0.7,
    };

    // Generate code
    const response = await llmProviderService.generate(
      configForGeneration,
      fullPrompt,
      {
        systemPrompt,
        maxTokens: 4000,
        temperature: 0.7,
      }
    );

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    // Calculate credits used
    const tokensUsed = response.tokens || 0;
    const creditsUsed = creditService.tokensToCredits(tokensUsed, selectedProvider);

    // Check if user has enough credits (if using credit payment)
    if (project.paymentType === 'credits') {
      const balance = await creditService.getBalance(user._id);
      if (balance < creditsUsed) {
        return NextResponse.json(
          { error: 'Insufficient credits', required: creditsUsed, available: balance },
          { status: 402 }
        );
      }

      // Deduct credits
      await creditService.useCredits(
        user._id,
        creditsUsed,
        `App generation for project: ${project.title}`,
        project._id,
        { tokens: tokensUsed, model: selectedModel, provider: selectedProvider }
      );
    }

    // Update project
    project.generatedCode = response.content;
    project.tokensUsed = (project.tokensUsed || 0) + tokensUsed;
    project.creditsUsed = (project.creditsUsed || 0) + creditsUsed;
    project.status = 'in_progress';
    await project.save();

    return NextResponse.json({
      code: response.content,
      tokens: tokensUsed,
      credits: creditsUsed,
      project: {
        tokensUsed: project.tokensUsed,
        creditsUsed: project.creditsUsed,
      },
    });
  } catch (error: any) {
    console.error('Error generating app code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate app code' },
      { status: 500 }
    );
  }
}

