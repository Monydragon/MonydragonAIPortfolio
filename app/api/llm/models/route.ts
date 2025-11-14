import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LLMConfig from "@/lib/models/LLMConfig";

// GET /api/llm/models?provider=ollama - Get available models for a provider
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const provider = searchParams.get("provider");
    const ollamaBaseUrl = searchParams.get("ollamaBaseUrl"); // Optional: override base URL

    if (!provider) {
      return NextResponse.json(
        { error: "Provider parameter is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const config = await LLMConfig.findOne().lean();

    let models: Array<{ id: string; name: string; description?: string }> = [];

    switch (provider) {
      case "ollama":
        try {
          const baseUrl = ollamaBaseUrl || config?.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434";
          const response = await fetch(`${baseUrl}/api/tags`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const data = await response.json();
            models = (data.models || []).map((model: any) => ({
              id: model.name,
              name: model.name,
              description: `${(model.size / 1024 / 1024 / 1024).toFixed(2)} GB`,
            }));
          } else {
            // Return common Ollama models as fallback
            models = [
              { id: "llama3.2", name: "llama3.2", description: "Recommended for general use" },
              { id: "llama3.1", name: "llama3.1", description: "Larger, more capable" },
              { id: "mistral", name: "mistral", description: "Fast and efficient" },
              { id: "codellama", name: "codellama", description: "Code-focused model" },
              { id: "phi3", name: "phi3", description: "Small, efficient model" },
            ];
          }
        } catch (error) {
          // Return common Ollama models as fallback
          models = [
            { id: "llama3.2", name: "llama3.2", description: "Recommended for general use" },
            { id: "llama3.1", name: "llama3.1", description: "Larger, more capable" },
            { id: "mistral", name: "mistral", description: "Fast and efficient" },
            { id: "codellama", name: "codellama", description: "Code-focused model" },
            { id: "phi3", name: "phi3", description: "Small, efficient model" },
          ];
        }
        break;

      case "openai":
        // Fetch actual models from OpenAI API
        try {
          const apiKey = config?.openaiApiKey || searchParams.get("apiKey");
          if (!apiKey) {
            // Return common models as fallback if no API key
            models = [
              { id: "gpt-4o", name: "gpt-4o", description: "Most capable model" },
              { id: "gpt-4o-mini", name: "gpt-4o-mini", description: "Fast and affordable" },
              { id: "gpt-4-turbo", name: "gpt-4-turbo", description: "High performance" },
              { id: "gpt-4", name: "gpt-4", description: "Standard GPT-4" },
              { id: "gpt-3.5-turbo", name: "gpt-3.5-turbo", description: "Fast and cost-effective" },
            ];
            break;
          }

          const baseUrl = config?.openaiBaseUrl || 'https://api.openai.com/v1';
          const response = await fetch(`${baseUrl}/models`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            // Filter for chat models and sort by ID
            const chatModels = (data.data || [])
              .filter((model: any) => 
                model.id.includes('gpt') && 
                (model.id.includes('gpt-4') || model.id.includes('gpt-3.5'))
              )
              .sort((a: any, b: any) => {
                // Sort by version (newer first)
                if (a.id.includes('gpt-4o') && !b.id.includes('gpt-4o')) return -1;
                if (!a.id.includes('gpt-4o') && b.id.includes('gpt-4o')) return 1;
                return b.id.localeCompare(a.id);
              })
              .map((model: any) => ({
                id: model.id,
                name: model.id,
                description: model.owned_by || 'OpenAI model',
              }));
            
            if (chatModels.length > 0) {
              models = chatModels;
            } else {
              // Fallback if no models found
              models = [
                { id: "gpt-4o", name: "gpt-4o", description: "Most capable model" },
                { id: "gpt-4o-mini", name: "gpt-4o-mini", description: "Fast and affordable" },
                { id: "gpt-4-turbo", name: "gpt-4-turbo", description: "High performance" },
                { id: "gpt-4", name: "gpt-4", description: "Standard GPT-4" },
                { id: "gpt-3.5-turbo", name: "gpt-3.5-turbo", description: "Fast and cost-effective" },
              ];
            }
          } else {
            // If API call fails, return common models
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenAI models API error:', errorData);
            models = [
              { id: "gpt-4o", name: "gpt-4o", description: "Most capable model" },
              { id: "gpt-4o-mini", name: "gpt-4o-mini", description: "Fast and affordable" },
              { id: "gpt-4-turbo", name: "gpt-4-turbo", description: "High performance" },
              { id: "gpt-4", name: "gpt-4", description: "Standard GPT-4" },
              { id: "gpt-3.5-turbo", name: "gpt-3.5-turbo", description: "Fast and cost-effective" },
            ];
          }
        } catch (error: any) {
          console.error('Error fetching OpenAI models:', error);
          // Return common models as fallback
          models = [
            { id: "gpt-4o", name: "gpt-4o", description: "Most capable model" },
            { id: "gpt-4o-mini", name: "gpt-4o-mini", description: "Fast and affordable" },
            { id: "gpt-4-turbo", name: "gpt-4-turbo", description: "High performance" },
            { id: "gpt-4", name: "gpt-4", description: "Standard GPT-4" },
            { id: "gpt-3.5-turbo", name: "gpt-3.5-turbo", description: "Fast and cost-effective" },
          ];
        }
        break;

      case "anthropic":
        // Anthropic Claude models
        models = [
          { id: "claude-3-5-sonnet-20241022", name: "claude-3-5-sonnet-20241022", description: "Latest and most capable" },
          { id: "claude-3-5-sonnet-20240620", name: "claude-3-5-sonnet-20240620", description: "Previous version" },
          { id: "claude-3-opus-20240229", name: "claude-3-opus-20240229", description: "Most powerful" },
          { id: "claude-3-sonnet-20240229", name: "claude-3-sonnet-20240229", description: "Balanced performance" },
          { id: "claude-3-haiku-20240307", name: "claude-3-haiku-20240307", description: "Fast and efficient" },
        ];
        break;

      case "google":
        // Fetch actual models from Google API
        try {
          const apiKey = config?.googleApiKey || searchParams.get("apiKey");
          if (!apiKey) {
            // Return common models as fallback if no API key
            models = [
              { id: "gemini-1.5-pro", name: "gemini-1.5-pro", description: "Most capable model" },
              { id: "gemini-1.5-flash", name: "gemini-1.5-flash", description: "Fast and efficient" },
              { id: "gemini-pro", name: "gemini-pro", description: "Standard model" },
            ];
            break;
          }

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            // Filter for Gemini models and sort
            const geminiModels = (data.models || [])
              .filter((model: any) => 
                model.name && 
                model.name.includes('gemini') &&
                model.supportedGenerationMethods?.includes('generateContent')
              )
              .sort((a: any, b: any) => {
                // Sort by version (newer first)
                if (a.name.includes('1.5') && !b.name.includes('1.5')) return -1;
                if (!a.name.includes('1.5') && b.name.includes('1.5')) return 1;
                if (a.name.includes('pro') && !b.name.includes('pro')) return -1;
                if (!a.name.includes('pro') && b.name.includes('pro')) return 1;
                return b.name.localeCompare(a.name);
              })
              .map((model: any) => ({
                id: model.name.replace('models/', ''),
                name: model.name.replace('models/', ''),
                description: model.displayName || model.description || 'Google Gemini model',
              }));
            
            if (geminiModels.length > 0) {
              models = geminiModels;
            } else {
              // Fallback if no models found
              models = [
                { id: "gemini-1.5-pro", name: "gemini-1.5-pro", description: "Most capable model" },
                { id: "gemini-1.5-flash", name: "gemini-1.5-flash", description: "Fast and efficient" },
                { id: "gemini-pro", name: "gemini-pro", description: "Standard model" },
              ];
            }
          } else {
            // If API call fails, return common models
            const errorData = await response.json().catch(() => ({}));
            console.error('Google models API error:', errorData);
            models = [
              { id: "gemini-1.5-pro", name: "gemini-1.5-pro", description: "Most capable model" },
              { id: "gemini-1.5-flash", name: "gemini-1.5-flash", description: "Fast and efficient" },
              { id: "gemini-pro", name: "gemini-pro", description: "Standard model" },
            ];
          }
        } catch (error: any) {
          console.error('Error fetching Google models:', error);
          // Return common models as fallback
          models = [
            { id: "gemini-1.5-pro", name: "gemini-1.5-pro", description: "Most capable model" },
            { id: "gemini-1.5-flash", name: "gemini-1.5-flash", description: "Fast and efficient" },
            { id: "gemini-pro", name: "gemini-pro", description: "Standard model" },
          ];
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unknown provider: ${provider}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ models });
  } catch (error: any) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch models" },
      { status: 500 }
    );
  }
}

