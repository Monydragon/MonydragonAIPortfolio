import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import LLMConfig from "@/lib/models/LLMConfig";
import { llmProviderService } from "@/lib/ai/llm-providers";

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
    const { action, customPrompt, ...params } = body;

    let prompt: string;
    let systemPrompt: string | undefined;

    switch (action) {
      case 'generate-full':
        const topic = params.topic || params.prompt;
        const tone = params.tone || 'professional';
        const generateMetadata = params.generateMetadata !== false;
        const customGenPrompt = config.customPrompts?.blogGeneration;
        
        // Generate the blog post content
        let contentPrompt: string;
        if (customPrompt) {
          contentPrompt = customPrompt.replace('{{topic}}', topic || '').replace('{{style}}', tone);
        } else if (customGenPrompt) {
          contentPrompt = customGenPrompt.replace('{{topic}}', topic || '').replace('{{style}}', tone);
        } else {
          contentPrompt = `Write a professional, well-structured blog post about "${topic}" in a ${tone} tone. 

CRITICAL FORMATTING REQUIREMENTS:
- Write in clean markdown format
- Include a compelling title as the first H1 heading (single #)
- Use proper paragraph breaks (double line breaks between paragraphs)
- Use H2 headings (##) for main sections (3-5 sections)
- Use H3 headings (###) for subsections if needed
- Use proper markdown lists (- for unordered, 1. for ordered)
- Use code blocks (\`\`\`language) for code examples
- Use **bold** for emphasis and *italic* for subtle emphasis
- Ensure proper spacing between all elements
- Each paragraph should be 2-4 sentences
- Use line breaks to separate paragraphs clearly
- Keep paragraphs concise and readable

CONTENT REQUIREMENTS:
- Start with an engaging introduction paragraph (2-3 sentences)
- Include 3-5 main sections with clear H2 headers
- Each section should have 2-3 paragraphs
- Add a conclusion section that summarizes key points
- Keep it informative, engaging, and well-organized
- Target length: 800-1200 words
- Ensure smooth transitions between sections

FORMATTING EXAMPLES:
- Paragraphs should be separated by blank lines
- Lists should be properly indented
- Code blocks should have language specified
- Headers should have proper spacing above and below

Topic: ${topic}
Tone: ${tone}

Begin the blog post with the title as H1, then the introduction:`;
        }

        const contentResult = await llmProviderService.generate(
          config as any,
          contentPrompt,
          {
            maxTokens: params.maxTokens || config.defaultMaxTokens || 2000,
            temperature: params.temperature ?? config.defaultTemperature ?? 0.7,
          }
        );

        if (contentResult.error) {
          return NextResponse.json(
            { error: contentResult.error },
            { status: 500 }
          );
        }

        let title = '';
        let content = contentResult.content;
        // Extract title from first H1
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
          title = titleMatch[1].trim();
          content = content.replace(/^#\s+.+$/m, '').trim();
        }

        // Generate metadata if requested
        let category = 'General';
        let tags: string[] = [];
        let seoTitle = title;
        let seoDescription = '';
        let excerpt = '';
        let coverImageUrl = '';

        if (generateMetadata) {
          // Generate metadata in parallel for better performance
          // If any fail, we'll continue with defaults
          try {
            const [categoryResult, tagsResult, seoTitleResult, seoDescResult, excerptResult] = await Promise.allSettled([
              // Generate category
              llmProviderService.generate(config as any, `Based on this blog post topic: "${topic}", suggest a single, concise category name (one word or short phrase). Return only the category name, nothing else.`, { maxTokens: 20, temperature: 0.3 }),
              // Generate tags
              llmProviderService.generate(config as any, `Generate 5-8 relevant tags for a blog post about "${topic}". Return only comma-separated tags, no explanation.`, { maxTokens: 50, temperature: 0.3 }),
              // Generate SEO title (only if we don't have one)
              !title ? llmProviderService.generate(config as any, `Generate a compelling, SEO-optimized title (max 60 characters) for a blog post about "${topic}". Return only the title.`, { maxTokens: 20, temperature: 0.5 }) : Promise.resolve({ content: '', error: null }),
              // Generate SEO description
              llmProviderService.generate(config as any, `Generate a concise, SEO-optimized meta description (max 160 characters) for a blog post about "${topic}". Return only the description.`, { maxTokens: 30, temperature: 0.5 }),
              // Generate excerpt
              llmProviderService.generate(config as any, `Generate a concise, engaging excerpt (2-3 sentences, max 200 characters) for a blog post about "${topic}". Return only the excerpt.`, { maxTokens: 50, temperature: 0.5 }),
            ]);

            // Process category
            if (categoryResult.status === 'fulfilled' && !categoryResult.value.error && categoryResult.value.content) {
              category = categoryResult.value.content.trim().split('\n')[0].trim();
            }

            // Process tags
            if (tagsResult.status === 'fulfilled' && !tagsResult.value.error && tagsResult.value.content) {
              tags = tagsResult.value.content
                .split(',')
                .map((t: string) => t.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, ''))
                .filter((t: string) => t.length > 0)
                .slice(0, 8);
            }

            // Process SEO title
            if (!title && seoTitleResult.status === 'fulfilled' && !seoTitleResult.value.error && seoTitleResult.value.content) {
              seoTitle = seoTitleResult.value.content.trim().split('\n')[0].trim().substring(0, 60);
            }

            // Process SEO description
            if (seoDescResult.status === 'fulfilled' && !seoDescResult.value.error && seoDescResult.value.content) {
              seoDescription = seoDescResult.value.content.trim().split('\n')[0].trim().substring(0, 160);
            }

            // Process excerpt
            if (excerptResult.status === 'fulfilled' && !excerptResult.value.error && excerptResult.value.content) {
              excerpt = excerptResult.value.content.trim().split('\n')[0].trim().substring(0, 200);
            }
          } catch (error) {
            // If metadata generation fails, continue with defaults
            console.warn('Some metadata generation failed, using defaults:', error);
          }

          // Suggest cover image (using Unsplash API or similar - for now, return a placeholder)
          // In production, you could integrate with Unsplash API or other image services
          coverImageUrl = `https://source.unsplash.com/1200x600/?${encodeURIComponent(topic)}`;
        }

        return NextResponse.json({
          title: title || topic,
          content,
          category,
          tags,
          seoTitle,
          seoDescription,
          excerpt,
          coverImage: coverImageUrl,
          tokens: contentResult.tokens,
        });

      case 'generate':
        const genTopic = params.topic || params.prompt;
        const genStyle = params.style || 'professional';
        const genCustomGenPrompt = config.customPrompts?.blogGeneration;
        
        if (customPrompt) {
          prompt = customPrompt.replace('{{topic}}', genTopic || '').replace('{{style}}', genStyle);
        } else if (genCustomGenPrompt) {
          prompt = genCustomGenPrompt.replace('{{topic}}', genTopic || '').replace('{{style}}', genStyle);
        } else {
          prompt = `Write a professional, well-structured blog post about "${genTopic}" in a ${genStyle} style.

CRITICAL FORMATTING REQUIREMENTS:
- Write in clean markdown format
- Include a compelling title as the first H1 heading (single #)
- Use proper paragraph breaks (double line breaks between paragraphs)
- Use H2 headings (##) for main sections (3-5 sections)
- Use H3 headings (###) for subsections if needed
- Use proper markdown lists (- for unordered, 1. for ordered)
- Use code blocks (\`\`\`language) for code examples
- Use **bold** for emphasis and *italic* for subtle emphasis
- Ensure proper spacing between all elements
- Each paragraph should be 2-4 sentences
- Use line breaks to separate paragraphs clearly
- Keep paragraphs concise and readable

CONTENT REQUIREMENTS:
- Start with an engaging introduction paragraph (2-3 sentences)
- Include 3-5 main sections with clear H2 headers
- Each section should have 2-3 paragraphs
- Add a conclusion section that summarizes key points
- Keep it informative, engaging, and well-organized
- Target length: 800-1200 words
- Ensure smooth transitions between sections

Topic: ${genTopic}
Style: ${genStyle}

Begin the blog post with the title as H1, then the introduction:`;
        }
        break;
      case 'improve':
        if (!params.content || !params.instruction) {
          return NextResponse.json(
            { error: 'Content and instruction are required for improvement' },
            { status: 400 }
          );
        }
        const customImpPrompt = config.customPrompts?.blogImprovement;
        let instructionText = params.instruction;
        
        // Add tone instruction if provided
        if (params.tone) {
          instructionText += ` Make the tone more ${params.tone}.`;
        }
        
        if (customPrompt) {
          prompt = customPrompt.replace('{{content}}', params.content).replace('{{instruction}}', instructionText);
        } else if (customImpPrompt) {
          prompt = customImpPrompt.replace('{{content}}', params.content).replace('{{instruction}}', instructionText);
        } else {
          prompt = `Improve the following content based on this instruction: "${instructionText}"

CRITICAL FORMATTING REQUIREMENTS:
- Maintain clean markdown format
- Use proper paragraph breaks (double line breaks between paragraphs)
- Use H2 headings (##) for main sections
- Use H3 headings (###) for subsections
- Use proper markdown lists (- for unordered, 1. for ordered)
- Use code blocks (\`\`\`language) for code examples
- Use **bold** for emphasis and *italic* for subtle emphasis
- Ensure proper spacing between all elements
- Each paragraph should be 2-4 sentences
- Keep paragraphs concise and readable

Original content:
${params.content}

Provide the improved content with proper formatting and structure:`;
        }
        break;
      case 'excerpt':
        if (!params.content) {
          return NextResponse.json(
            { error: 'Content is required for excerpt generation' },
            { status: 400 }
          );
        }
        const customExcPrompt = config.customPrompts?.excerptGeneration;
        
        if (customPrompt) {
          prompt = customPrompt.replace('{{content}}', params.content);
        } else if (customExcPrompt) {
          prompt = customExcPrompt.replace('{{content}}', params.content);
        } else {
          prompt = `Generate a concise, engaging excerpt (2-3 sentences, max 200 characters) for this blog post:

${params.content}

Excerpt:`;
        }
        break;
      case 'tags':
        if (!params.content) {
          return NextResponse.json(
            { error: 'Content is required for tag generation' },
            { status: 400 }
          );
        }
        const customTagPrompt = config.customPrompts?.tagGeneration;
        
        if (customPrompt) {
          prompt = customPrompt.replace('{{content}}', params.content.substring(0, 1000));
        } else if (customTagPrompt) {
          prompt = customTagPrompt.replace('{{content}}', params.content.substring(0, 1000));
        } else {
          prompt = `Generate 5-8 relevant tags for this blog post content. Return only comma-separated tags, no explanation:

${params.content.substring(0, 1000)}

Tags:`;
        }
        break;
      case 'custom':
        if (!customPrompt) {
          return NextResponse.json(
            { error: 'Custom prompt is required' },
            { status: 400 }
          );
        }
        prompt = customPrompt;
        if (params.systemPrompt) {
          systemPrompt = params.systemPrompt;
        }
        break;
      case 'suggest-cover-image':
        // This is a placeholder - in production, integrate with image APIs
        // For now, return an Unsplash URL based on title/content
        const searchTerm = params.title || params.content?.substring(0, 50) || 'blog';
        return NextResponse.json({
          coverImageUrl: `https://source.unsplash.com/1200x600/?${encodeURIComponent(searchTerm)}`,
        });

      case 'generate-seo-title':
        if (!params.title && !params.content) {
          return NextResponse.json(
            { error: 'Title or content is required' },
            { status: 400 }
          );
        }
        const seoTitlePrompt = `Generate a compelling, SEO-optimized title (max 60 characters) for a blog post. 
Title: ${params.title || 'N/A'}
Content preview: ${params.content?.substring(0, 200) || 'N/A'}

Return only the SEO title, nothing else.`;
        const seoTitleResult = await llmProviderService.generate(config as any, seoTitlePrompt, { maxTokens: 20, temperature: 0.5 });
        if (seoTitleResult.error) {
          return NextResponse.json({ error: seoTitleResult.error }, { status: 500 });
        }
        return NextResponse.json({
          seoTitle: seoTitleResult.content.trim().split('\n')[0].trim().substring(0, 60),
        });

      case 'generate-seo-description':
        if (!params.title && !params.content) {
          return NextResponse.json(
            { error: 'Title or content is required' },
            { status: 400 }
          );
        }
        const seoDescPrompt = `Generate a concise, SEO-optimized meta description (max 160 characters) for a blog post.
Title: ${params.title || 'N/A'}
Content preview: ${params.content?.substring(0, 200) || 'N/A'}

Return only the SEO description, nothing else.`;
        const seoDescResult = await llmProviderService.generate(config as any, seoDescPrompt, { maxTokens: 30, temperature: 0.5 });
        if (seoDescResult.error) {
          return NextResponse.json({ error: seoDescResult.error }, { status: 500 });
        }
        return NextResponse.json({
          seoDescription: seoDescResult.content.trim().split('\n')[0].trim().substring(0, 160),
        });

      case 'generate-category':
        if (!params.title && !params.content) {
          return NextResponse.json(
            { error: 'Title or content is required' },
            { status: 400 }
          );
        }
        const categoryPrompt = `Based on this blog post, suggest a single, concise category name (one word or short phrase).
Title: ${params.title || 'N/A'}
Content preview: ${params.content?.substring(0, 200) || 'N/A'}

Return only the category name, nothing else.`;
        const categoryResult = await llmProviderService.generate(config as any, categoryPrompt, { maxTokens: 20, temperature: 0.3 });
        if (categoryResult.error) {
          return NextResponse.json({ error: categoryResult.error }, { status: 500 });
        }
        return NextResponse.json({
          category: categoryResult.content.trim().split('\n')[0].trim(),
        });

      case 'format-text':
        if (!params.content) {
          return NextResponse.json(
            { error: 'Content is required for text formatting' },
            { status: 400 }
          );
        }
        const customFormatPrompt = config.customPrompts?.textFormatting;
        
        if (customPrompt) {
          prompt = customPrompt.replace('{{content}}', params.content);
        } else if (customFormatPrompt) {
          prompt = customFormatPrompt.replace('{{content}}', params.content);
        } else {
          prompt = `Format and clean up the following blog post content. Make it well-structured, readable, and properly formatted using markdown.

CRITICAL FORMATTING REQUIREMENTS:
- Convert to clean, proper markdown format
- Use proper paragraph breaks (double line breaks between paragraphs)
- Ensure each paragraph is 2-4 sentences and flows well
- Add appropriate H2 headings (##) for main sections if the content is long enough
- Add H3 headings (###) for subsections when appropriate
- Use proper markdown lists (- for unordered, 1. for ordered) when content is list-like
- Use code blocks (\`\`\`language) for any code snippets
- Use **bold** for important terms and *italic* for emphasis
- Ensure proper spacing between all elements (blank lines between paragraphs, sections, etc.)
- Remove any excessive blank lines or formatting inconsistencies
- Fix any grammar or spelling errors
- Ensure smooth transitions between paragraphs
- Keep the original meaning and content, only improve formatting and structure
- Make paragraphs concise, clear, and engaging
- If the content is a single paragraph or very short, keep it as is but ensure proper formatting

BLOG-SPECIFIC FORMATTING:
- Start with a clear introduction if the content doesn't have one
- Use descriptive section headings that summarize the content
- Ensure code examples are properly formatted with language tags
- Make sure lists are properly formatted and indented
- Ensure quotes are properly formatted with > if present
- Keep the tone and style consistent throughout

Original content:
${params.content}

Provide the formatted and cleaned content with proper markdown structure:`;
        }
        systemPrompt = `You are an expert blog editor specializing in markdown formatting. Your task is to format and clean up blog content while preserving the original meaning and improving readability. Focus on proper markdown syntax, clear paragraph structure, appropriate headings, and clean formatting.`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: generate, generate-full, improve, format-text, excerpt, tags, custom, suggest-cover-image, generate-seo-title, generate-seo-description, or generate-category' },
          { status: 400 }
        );
    }

    let result;
    try {
      result = await llmProviderService.generate(
        config as any,
        prompt,
        {
          maxTokens: params.maxTokens || config.defaultMaxTokens,
          temperature: params.temperature ?? config.defaultTemperature,
          systemPrompt,
        }
      );
    } catch (error: any) {
      console.error('LLM generation error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to generate content. Please check your LLM configuration.' },
        { status: 500 }
      );
    }

    if (result.error) {
      console.error('LLM provider error:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // For tags, parse the response
    if (action === 'tags' && result.content) {
      const tags = result.content
        .split(',')
        .map((tag: string) => tag.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, ''))
        .filter((tag: string) => tag.length > 0)
        .slice(0, 8);
      
      return NextResponse.json({
        content: tags.join(', '),
        tokens: result.tokens,
      });
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
      { available: false, error: error.message },
      { status: 500 }
    );
  }
}

