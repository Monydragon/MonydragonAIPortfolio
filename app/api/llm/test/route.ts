import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import LLMConfig from "@/lib/models/LLMConfig";
import { llmProviderService } from "@/lib/ai/llm-providers";

// POST /api/llm/test - Test LLM connection and generation (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const config = await LLMConfig.findOne().lean();

    if (!config || !config.enabled || config.provider === 'none') {
      return NextResponse.json(
        { error: 'LLM is not configured or enabled' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Test with a simple prompt
    const testPrompt = prompt || "Say 'Hello, this is a test' and nothing else.";
    const result = await llmProviderService.generate(
      config as any,
      testPrompt,
      {
        maxTokens: 50,
        temperature: 0.5,
      }
    );

    if (result.error) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error,
          provider: config.provider,
          model: config.ollamaModel || config.openaiModel || config.anthropicModel || config.googleModel,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      response: result.content,
      tokens: result.tokens,
      provider: config.provider,
      model: config.ollamaModel || config.openaiModel || config.anthropicModel || config.googleModel,
    });
  } catch (error: any) {
    console.error('LLM test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to test LLM',
      },
      { status: 500 }
    );
  }
}

