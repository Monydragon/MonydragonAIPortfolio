import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { llmService, checkLLMAvailability } from "@/lib/ai/llm-service";

// POST /api/blog/ai/generate - Generate blog content using AI (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isAvailable = await checkLLMAvailability();
    
    if (!isAvailable) {
      return NextResponse.json(
        { 
          error: 'Local LLM service is not available',
          message: 'Please ensure Ollama is running on your server. Install from https://ollama.ai and run: ollama pull llama3.2'
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { topic, style, action } = body;

    if (!topic && action !== 'improve' && action !== 'excerpt' && action !== 'tags') {
      return NextResponse.json(
        { error: 'Topic is required for generation' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'generate':
        result = await llmService.generateBlogPost(topic, style || 'professional');
        break;
      case 'improve':
        if (!body.content || !body.instruction) {
          return NextResponse.json(
            { error: 'Content and instruction are required for improvement' },
            { status: 400 }
          );
        }
        result = await llmService.improveContent(body.content, body.instruction);
        break;
      case 'excerpt':
        if (!body.content) {
          return NextResponse.json(
            { error: 'Content is required for excerpt generation' },
            { status: 400 }
          );
        }
        result = await llmService.generateExcerpt(body.content);
        break;
      case 'tags':
        if (!body.content) {
          return NextResponse.json(
            { error: 'Content is required for tag generation' },
            { status: 400 }
          );
        }
        result = await llmService.generateTags(body.content);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: generate, improve, excerpt, or tags' },
          { status: 400 }
        );
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: result.content,
      tokens: result.tokens,
    });
  } catch (error: any) {
    console.error('Error generating AI content:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI content' },
      { status: 500 }
    );
  }
}

// GET /api/blog/ai/status - Check LLM availability
export async function GET() {
  try {
    const isAvailable = await checkLLMAvailability();
    
    return NextResponse.json({
      available: isAvailable,
      provider: 'ollama',
      model: process.env.OLLAMA_MODEL || 'llama3.2',
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    });
  } catch (error: any) {
    return NextResponse.json(
      { available: false, error: error.message },
      { status: 500 }
    );
  }
}

