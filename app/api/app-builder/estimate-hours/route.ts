import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import LLMConfig from '@/lib/models/LLMConfig';
import { llmProviderService } from '@/lib/ai/llm-providers';

// POST /api/app-builder/estimate-hours - Use LLM to estimate project hours
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const config = await LLMConfig.findOne().lean();

    if (!config || !config.enabled || config.provider === 'none') {
      return NextResponse.json(
        { 
          error: 'LLM is not configured or enabled',
          message: 'Please configure an LLM provider in the admin dashboard'
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      appType,
      description,
      features,
      complexity,
      techStack,
      platforms,
      integrations,
      targetAudience,
      experienceLevel,
    } = body;

    if (!description) {
      return NextResponse.json(
        { error: 'Project description is required' },
        { status: 400 }
      );
    }

    // Build comprehensive prompt for hours estimation
    const prompt = `You are an expert software development project estimator with 20+ years of experience. 
Analyze the following project requirements and provide a detailed hour estimate.

PROJECT DETAILS:
- Application Type: ${appType || 'Not specified'}
- Description: ${description}
- Complexity Level: ${complexity || 'medium'}
- Experience Level: ${experienceLevel || 'intermediate'}

${features && features.length > 0 ? `- Key Features:\n${features.map((f: string) => `  • ${f}`).join('\n')}` : ''}
${techStack && techStack.length > 0 ? `- Tech Stack: ${techStack.join(', ')}` : ''}
${platforms && platforms.length > 0 ? `- Platforms: ${platforms.join(', ')}` : ''}
${integrations && integrations.length > 0 ? `- Integrations: ${integrations.join(', ')}` : ''}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}

ESTIMATION REQUIREMENTS:
1. Break down the project into major phases (Planning, Design, Development, Testing, Deployment)
2. Estimate hours for each phase
3. Consider the complexity level and experience level
4. Account for:
   - Setup and configuration time
   - Core feature development
   - Integration work
   - Testing and debugging
   - Documentation
   - Deployment and setup
5. Add appropriate buffer for unexpected issues (15-20%)
6. Consider if this is hands-on (mentored) or hands-off (independent) development

RESPONSE FORMAT (JSON):
{
  "totalHours": <number>,
  "breakdown": {
    "planning": <number>,
    "design": <number>,
    "development": <number>,
    "testing": <number>,
    "deployment": <number>,
    "buffer": <number>
  },
  "confidence": "high" | "medium" | "low",
  "notes": "<brief explanation of estimate>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>"]
}

Provide ONLY valid JSON, no additional text.`;

    const systemPrompt = `You are a professional software development estimator. 
Provide accurate, realistic hour estimates based on project requirements. 
Always return valid JSON format. Consider all aspects: complexity, features, integrations, and experience level.`;

    const result = await llmProviderService.generate(
      config as any,
      prompt,
      {
        maxTokens: config.defaultMaxTokens || 2000,
        temperature: 0.3, // Lower temperature for more consistent estimates
        systemPrompt,
      }
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let estimate;
    try {
      // Try to extract JSON from the response (in case LLM adds extra text)
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        estimate = JSON.parse(jsonMatch[0]);
      } else {
        estimate = JSON.parse(result.content);
      }
    } catch (parseError) {
      // If parsing fails, provide a fallback estimate
      console.error('Failed to parse LLM response:', result.content);
      estimate = {
        totalHours: 40,
        breakdown: {
          planning: 5,
          design: 8,
          development: 20,
          testing: 5,
          deployment: 2,
          buffer: 8,
        },
        confidence: 'low',
        notes: 'Unable to parse LLM response, using fallback estimate',
        recommendations: ['Please review the estimate manually'],
      };
    }

    // Validate and sanitize the estimate
    if (!estimate.totalHours || estimate.totalHours < 1) {
      estimate.totalHours = 20; // Minimum fallback
    }

    // Ensure breakdown exists
    if (!estimate.breakdown) {
      estimate.breakdown = {
        planning: Math.ceil(estimate.totalHours * 0.1),
        design: Math.ceil(estimate.totalHours * 0.15),
        development: Math.ceil(estimate.totalHours * 0.5),
        testing: Math.ceil(estimate.totalHours * 0.15),
        deployment: Math.ceil(estimate.totalHours * 0.05),
        buffer: Math.ceil(estimate.totalHours * 0.15),
      };
    }

    return NextResponse.json({
      estimate,
      tokens: result.tokens,
    });
  } catch (error: any) {
    console.error('Error estimating hours:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to estimate hours' },
      { status: 500 }
    );
  }
}

