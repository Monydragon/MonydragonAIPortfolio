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

    const statusResult = await llmProviderService.checkAvailability(config as any);

    // Determine status level: success, warning, or failed
    let statusLevel: 'success' | 'warning' | 'failed' = 'failed';
    if (statusResult.available) {
      // Check if configured model is available (for Ollama)
      if (config.provider === 'ollama' && statusResult.details) {
        if (statusResult.details.modelAvailable === false) {
          statusLevel = 'warning';
        } else {
          statusLevel = 'success';
        }
      } else {
        statusLevel = 'success';
      }
    }

    return NextResponse.json({
      available: statusResult.available,
      status: statusLevel,
      provider: config.provider,
      model: config.ollamaModel || config.openaiModel || config.anthropicModel || config.googleModel,
      message: statusResult.message || (statusResult.available
        ? `${config.provider} is available`
        : `${config.provider} is not available. Please check your configuration.`),
      details: statusResult.details,
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

