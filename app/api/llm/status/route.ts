import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LLMConfig from "@/lib/models/LLMConfig";
import { llmProviderService } from "@/lib/ai/llm-providers";

// GET /api/llm/status - Check LLM availability
export async function GET() {
  try {
    await connectDB();

    const config = await LLMConfig.findOne().lean();

    if (!config || !config.enabled || config.provider === 'none') {
      return NextResponse.json({
        available: false,
        provider: 'none',
        message: 'LLM is not configured or enabled',
      });
    }

    const isAvailable = await llmProviderService.checkAvailability(config as any);

    return NextResponse.json({
      available: isAvailable,
      provider: config.provider,
      model: config.ollamaModel || config.openaiModel || config.anthropicModel || config.googleModel,
      message: isAvailable
        ? `${config.provider} is available`
        : `${config.provider} is not available. Please check your configuration.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        available: false,
        error: error.message || "Failed to check LLM status",
      },
      { status: 500 }
    );
  }
}

