import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LLMConfig from "@/lib/models/LLMConfig";

// GET /api/llm/models/library - Get available models from Ollama library with search and filter support
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const config = await LLMConfig.findOne().lean();
    const baseUrl = config?.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search")?.toLowerCase() || "";
    const sizeFilter = searchParams.get("size") || "all";
    const tagFilter = searchParams.get("tag") || "all";
    const sortBy = searchParams.get("sort") || "name";

    // Comprehensive Ollama models with descriptions, sizes, and metadata
    // Size in bytes for filtering, and lastUpdated for sorting
    const allModels = [
      {
        id: "llama3.2",
        name: "llama3.2",
        description: "Fast and efficient, great for general use",
        size: "~2GB",
        sizeBytes: 2147483648,
        sizeCategory: "small",
        tags: ["general", "fast", "recommended"],
        lastUpdated: "2024-10-01",
        parameters: "3B",
        family: "llama",
      },
      {
        id: "llama3.1",
        name: "llama3.1",
        description: "Larger and more capable than 3.2",
        size: "~4.5GB",
        sizeBytes: 4831838208,
        sizeCategory: "medium",
        tags: ["general", "capable"],
        lastUpdated: "2024-09-15",
        parameters: "8B",
        family: "llama",
      },
      {
        id: "llama3.1:8b",
        name: "llama3.1:8b",
        description: "8B parameter version",
        size: "~4.5GB",
        sizeBytes: 4831838208,
        sizeCategory: "medium",
        tags: ["general"],
        lastUpdated: "2024-09-15",
        parameters: "8B",
        family: "llama",
      },
      {
        id: "llama3.1:70b",
        name: "llama3.1:70b",
        description: "70B parameter version (very large)",
        size: "~40GB",
        sizeBytes: 42949672960,
        sizeCategory: "xlarge",
        tags: ["general", "large"],
        lastUpdated: "2024-09-15",
        parameters: "70B",
        family: "llama",
      },
      {
        id: "mistral",
        name: "mistral",
        description: "Fast and efficient alternative",
        size: "~4GB",
        sizeBytes: 4294967296,
        sizeCategory: "medium",
        tags: ["general", "fast"],
        lastUpdated: "2024-08-20",
        parameters: "7B",
        family: "mistral",
      },
      {
        id: "mistral:7b",
        name: "mistral:7b",
        description: "7B parameter version",
        size: "~4GB",
        sizeBytes: 4294967296,
        sizeCategory: "medium",
        tags: ["general"],
        lastUpdated: "2024-08-20",
        parameters: "7B",
        family: "mistral",
      },
      {
        id: "mistral:8x7b",
        name: "mistral:8x7b",
        description: "Mixture of Experts model",
        size: "~26GB",
        sizeBytes: 27917287424,
        sizeCategory: "xlarge",
        tags: ["general", "large"],
        lastUpdated: "2024-08-20",
        parameters: "8x7B",
        family: "mistral",
      },
      {
        id: "codellama",
        name: "codellama",
        description: "Specialized for code generation and understanding",
        size: "~3.8GB",
        sizeBytes: 4080218931,
        sizeCategory: "medium",
        tags: ["code", "technical"],
        lastUpdated: "2024-07-10",
        parameters: "7B",
        family: "llama",
      },
      {
        id: "codellama:7b",
        name: "codellama:7b",
        description: "7B parameter code model",
        size: "~3.8GB",
        sizeBytes: 4080218931,
        sizeCategory: "medium",
        tags: ["code"],
        lastUpdated: "2024-07-10",
        parameters: "7B",
        family: "llama",
      },
      {
        id: "codellama:13b",
        name: "codellama:13b",
        description: "13B parameter code model",
        size: "~7GB",
        sizeBytes: 7516192768,
        sizeCategory: "large",
        tags: ["code"],
        lastUpdated: "2024-07-10",
        parameters: "13B",
        family: "llama",
      },
      {
        id: "codellama:34b",
        name: "codellama:34b",
        description: "34B parameter code model",
        size: "~19GB",
        sizeBytes: 20401094656,
        sizeCategory: "xlarge",
        tags: ["code", "large"],
        lastUpdated: "2024-07-10",
        parameters: "34B",
        family: "llama",
      },
      {
        id: "phi3",
        name: "phi3",
        description: "Small, efficient model from Microsoft",
        size: "~2.3GB",
        sizeBytes: 2469606195,
        sizeCategory: "small",
        tags: ["general", "small", "efficient"],
        lastUpdated: "2024-04-15",
        parameters: "3.8B",
        family: "phi",
      },
      {
        id: "phi3:mini",
        name: "phi3:mini",
        description: "Mini version - very small and fast",
        size: "~2.3GB",
        sizeBytes: 2469606195,
        sizeCategory: "small",
        tags: ["general", "small"],
        lastUpdated: "2024-04-15",
        parameters: "3.8B",
        family: "phi",
      },
      {
        id: "phi3:medium",
        name: "phi3:medium",
        description: "Medium version with better capabilities",
        size: "~7GB",
        sizeBytes: 7516192768,
        sizeCategory: "large",
        tags: ["general"],
        lastUpdated: "2024-04-15",
        parameters: "14B",
        family: "phi",
      },
      {
        id: "gemma:2b",
        name: "gemma:2b",
        description: "Google's Gemma 2B model - very small",
        size: "~1.4GB",
        sizeBytes: 1503238554,
        sizeCategory: "small",
        tags: ["general", "small"],
        lastUpdated: "2024-02-21",
        parameters: "2B",
        family: "gemma",
      },
      {
        id: "gemma:7b",
        name: "gemma:7b",
        description: "Google's Gemma 7B model",
        size: "~4.7GB",
        sizeBytes: 5046586573,
        sizeCategory: "medium",
        tags: ["general"],
        lastUpdated: "2024-02-21",
        parameters: "7B",
        family: "gemma",
      },
      {
        id: "neural-chat",
        name: "neural-chat",
        description: "Optimized for conversational AI",
        size: "~4GB",
        sizeBytes: 4294967296,
        sizeCategory: "medium",
        tags: ["chat", "conversation"],
        lastUpdated: "2024-06-10",
        parameters: "7B",
        family: "neural",
      },
      {
        id: "starling-lm",
        name: "starling-lm",
        description: "High-quality conversational model",
        size: "~4GB",
        sizeBytes: 4294967296,
        sizeCategory: "medium",
        tags: ["chat", "conversation"],
        lastUpdated: "2024-05-20",
        parameters: "7B",
        family: "starling",
      },
      {
        id: "llama2",
        name: "llama2",
        description: "Previous generation Llama model",
        size: "~3.8GB",
        sizeBytes: 4080218931,
        sizeCategory: "medium",
        tags: ["general", "legacy"],
        lastUpdated: "2023-07-18",
        parameters: "7B",
        family: "llama",
      },
      {
        id: "llama2:13b",
        name: "llama2:13b",
        description: "13B parameter Llama2",
        size: "~7GB",
        sizeBytes: 7516192768,
        sizeCategory: "large",
        tags: ["general"],
        lastUpdated: "2023-07-18",
        parameters: "13B",
        family: "llama",
      },
      {
        id: "llama2:70b",
        name: "llama2:70b",
        description: "70B parameter Llama2",
        size: "~40GB",
        sizeBytes: 42949672960,
        sizeCategory: "xlarge",
        tags: ["general", "large"],
        lastUpdated: "2023-07-18",
        parameters: "70B",
        family: "llama",
      },
      {
        id: "orca-mini",
        name: "orca-mini",
        description: "Small model optimized for instruction following",
        size: "~1.3GB",
        sizeBytes: 1395864371,
        sizeCategory: "small",
        tags: ["general", "small", "instructions"],
        lastUpdated: "2024-03-15",
        parameters: "3B",
        family: "orca",
      },
      {
        id: "vicuna",
        name: "vicuna",
        description: "High-quality conversational model",
        size: "~7GB",
        sizeBytes: 7516192768,
        sizeCategory: "large",
        tags: ["chat", "conversation"],
        lastUpdated: "2024-01-10",
        parameters: "13B",
        family: "vicuna",
      },
      {
        id: "wizardcoder",
        name: "wizardcoder",
        description: "Specialized for code generation",
        size: "~13GB",
        sizeBytes: 13958643712,
        sizeCategory: "large",
        tags: ["code", "large"],
        lastUpdated: "2024-04-05",
        parameters: "15B",
        family: "wizard",
      },
      {
        id: "deepseek-coder",
        name: "deepseek-coder",
        description: "Advanced code generation model",
        size: "~7GB",
        sizeBytes: 7516192768,
        sizeCategory: "large",
        tags: ["code"],
        lastUpdated: "2024-05-15",
        parameters: "7B",
        family: "deepseek",
      },
      {
        id: "deepseek-coder:33b",
        name: "deepseek-coder:33b",
        description: "33B parameter code model",
        size: "~19GB",
        sizeBytes: 20401094656,
        sizeCategory: "xlarge",
        tags: ["code", "large"],
        lastUpdated: "2024-05-15",
        parameters: "33B",
        family: "deepseek",
      },
      {
        id: "qwen",
        name: "qwen",
        description: "Alibaba's Qwen model",
        size: "~4GB",
        sizeBytes: 4294967296,
        sizeCategory: "medium",
        tags: ["general"],
        lastUpdated: "2024-06-20",
        parameters: "7B",
        family: "qwen",
      },
      {
        id: "qwen:14b",
        name: "qwen:14b",
        description: "14B parameter Qwen",
        size: "~8GB",
        sizeBytes: 8589934592,
        sizeCategory: "large",
        tags: ["general"],
        lastUpdated: "2024-06-20",
        parameters: "14B",
        family: "qwen",
      },
      {
        id: "nous-hermes",
        name: "nous-hermes",
        description: "Instruction-tuned model",
        size: "~4GB",
        sizeBytes: 4294967296,
        sizeCategory: "medium",
        tags: ["general", "instructions"],
        lastUpdated: "2024-03-20",
        parameters: "7B",
        family: "hermes",
      },
      {
        id: "openchat",
        name: "openchat",
        description: "Open source chat model",
        size: "~4GB",
        sizeBytes: 4294967296,
        sizeCategory: "medium",
        tags: ["chat", "conversation"],
        lastUpdated: "2024-04-10",
        parameters: "7B",
        family: "openchat",
      },
      {
        id: "solar",
        name: "solar",
        description: "Upstage's Solar model",
        size: "~7GB",
        sizeBytes: 7516192768,
        sizeCategory: "large",
        tags: ["general"],
        lastUpdated: "2024-05-25",
        parameters: "10.7B",
        family: "solar",
      },
      {
        id: "yi",
        name: "yi",
        description: "01.AI's Yi model",
        size: "~7GB",
        sizeBytes: 7516192768,
        sizeCategory: "large",
        tags: ["general"],
        lastUpdated: "2024-06-15",
        parameters: "6B",
        family: "yi",
      },
      {
        id: "yi:34b",
        name: "yi:34b",
        description: "34B parameter Yi model",
        size: "~19GB",
        sizeBytes: 20401094656,
        sizeCategory: "xlarge",
        tags: ["general", "large"],
        lastUpdated: "2024-06-15",
        parameters: "34B",
        family: "yi",
      },
    ];

    // Try to fetch installed models to mark which ones are already installed
    let installedModels: string[] = [];
    try {
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        installedModels = (data.models || []).map((m: any) => m.name);
      }
    } catch {
      // Ignore errors - just won't mark installed models
    }

    // Mark which models are installed
    let modelsWithStatus = allModels.map((model) => ({
      ...model,
      installed: installedModels.includes(model.name) || installedModels.some((installed) => 
        installed.startsWith(model.name + ":") || model.name.startsWith(installed)
      ),
    }));

    // Apply search filter
    if (search) {
      modelsWithStatus = modelsWithStatus.filter((model) =>
        model.name.toLowerCase().includes(search) ||
        model.description.toLowerCase().includes(search) ||
        model.tags.some((tag) => tag.toLowerCase().includes(search)) ||
        model.family.toLowerCase().includes(search)
      );
    }

    // Apply size filter
    if (sizeFilter !== "all") {
      modelsWithStatus = modelsWithStatus.filter((model) => model.sizeCategory === sizeFilter);
    }

    // Apply tag filter
    if (tagFilter !== "all") {
      modelsWithStatus = modelsWithStatus.filter((model) => model.tags.includes(tagFilter));
    }

    // Apply sorting
    modelsWithStatus.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return a.sizeBytes - b.sizeBytes;
        case "size-desc":
          return b.sizeBytes - a.sizeBytes;
        case "updated":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case "updated-asc":
          return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

    // Get unique tags and size categories for filter options
    const allTags = Array.from(new Set(allModels.flatMap((m) => m.tags))).sort();
    const sizeCategories = [
      { value: "small", label: "Small (<2GB)" },
      { value: "medium", label: "Medium (2-7GB)" },
      { value: "large", label: "Large (7-20GB)" },
      { value: "xlarge", label: "Extra Large (>20GB)" },
    ];

    return NextResponse.json({
      models: modelsWithStatus,
      total: allModels.length,
      filtered: modelsWithStatus.length,
      filters: {
        tags: allTags,
        sizeCategories,
      },
      libraryUrl: "https://ollama.com/library",
      note: "This is a curated list. Visit https://ollama.com/library for the complete list of available models.",
    });
  } catch (error: any) {
    console.error("Error fetching model library:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch model library" },
      { status: 500 }
    );
  }
}
