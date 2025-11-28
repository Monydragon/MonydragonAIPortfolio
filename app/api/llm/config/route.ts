import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import LLMConfig from "@/lib/models/LLMConfig";
import User from "@/lib/models/User";
import permissionService from "@/lib/services/permission-service";
import mongoose from "mongoose";

// GET /api/llm/config - Get LLM configuration
export async function GET() {
  try {
    await connectDB();

    let config = await LLMConfig.findOne().lean();

    // If no config exists, return default
    if (!config) {
      return NextResponse.json({
        provider: 'none',
        enabled: false,
        ollamaBaseUrl: 'http://localhost:11434',
        ollamaModel: 'llama3.2',
        openaiModel: 'gpt-4o-mini',
        anthropicModel: 'claude-3-5-sonnet-20241022',
        googleModel: 'gemini-1.5-flash',
        defaultMaxTokens: 2000,
        defaultTemperature: 0.7,
      });
    }

    // Don't expose API keys in GET response
    const { openaiApiKey, anthropicApiKey, googleApiKey, ...safeConfig } = config as any;

    return NextResponse.json({
      ...safeConfig,
      hasOpenAIKey: !!openaiApiKey,
      hasAnthropicKey: !!anthropicApiKey,
      hasGoogleKey: !!googleApiKey,
    });
  } catch (error: any) {
    console.error("Error fetching LLM config:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch LLM configuration" },
      { status: 500 }
    );
  }
}

// POST /api/llm/config - Create or update LLM configuration (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if user has admin.settings permission
    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasPermission = await permissionService.hasPermission(user._id, 'admin.settings');
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions. Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const {
      provider,
      enabled,
      ollamaBaseUrl,
      ollamaModel,
      openaiApiKey,
      openaiModel,
      openaiBaseUrl,
      anthropicApiKey,
      anthropicModel,
      googleApiKey,
      googleModel,
      defaultMaxTokens,
      defaultTemperature,
      customPrompts,
    } = body;

    // Find existing config or create new
    let config = await LLMConfig.findOne();

    if (config) {
      // Update existing
      config.provider = provider || config.provider;
      config.enabled = enabled !== undefined ? enabled : config.enabled;
      if (ollamaBaseUrl !== undefined) config.ollamaBaseUrl = ollamaBaseUrl;
      if (ollamaModel !== undefined) config.ollamaModel = ollamaModel;
      if (openaiApiKey !== undefined) config.openaiApiKey = openaiApiKey;
      if (openaiModel !== undefined) config.openaiModel = openaiModel;
      if (openaiBaseUrl !== undefined) config.openaiBaseUrl = openaiBaseUrl;
      if (anthropicApiKey !== undefined) config.anthropicApiKey = anthropicApiKey;
      if (anthropicModel !== undefined) config.anthropicModel = anthropicModel;
      if (googleApiKey !== undefined) config.googleApiKey = googleApiKey;
      if (googleModel !== undefined) config.googleModel = googleModel;
      if (defaultMaxTokens !== undefined) config.defaultMaxTokens = defaultMaxTokens;
      if (defaultTemperature !== undefined) config.defaultTemperature = defaultTemperature;
      if (customPrompts !== undefined) config.customPrompts = customPrompts;
      config.updatedBy = user._id as mongoose.Types.ObjectId;

      await config.save();
    } else {
      // Create new
      config = await LLMConfig.create({
        provider: provider || 'none',
        enabled: enabled || false,
        ollamaBaseUrl: ollamaBaseUrl || 'http://localhost:11434',
        ollamaModel: ollamaModel || 'llama3.2',
        openaiApiKey,
        openaiModel: openaiModel || 'gpt-4o-mini',
        openaiBaseUrl: openaiBaseUrl || 'https://api.openai.com/v1',
        anthropicApiKey,
        anthropicModel: anthropicModel || 'claude-3-5-sonnet-20241022',
        googleApiKey,
        googleModel: googleModel || 'gemini-1.5-flash',
        defaultMaxTokens: defaultMaxTokens || 2000,
        defaultTemperature: defaultTemperature ?? 0.7,
        customPrompts: customPrompts || {},
        updatedBy: user._id as mongoose.Types.ObjectId,
      });
    }

    // Return config without API keys
    const { openaiApiKey: _, anthropicApiKey: __, googleApiKey: ___, ...safeConfig } = config.toObject();

    return NextResponse.json({
      ...safeConfig,
      hasOpenAIKey: !!config.openaiApiKey,
      hasAnthropicKey: !!config.anthropicApiKey,
      hasGoogleKey: !!config.googleApiKey,
    });
  } catch (error: any) {
    console.error("Error saving LLM config:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save LLM configuration" },
      { status: 500 }
    );
  }
}

