"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useSound } from "@/hooks/useSound";
import { RichMarkdownEditor } from "./RichMarkdownEditor";
import { AIPromptComposer } from "./AIPromptComposer";
import { AIAssistant } from "./AIAssistant";

interface BlogPost {
  _id?: string;
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  category: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  coverImage?: string;
}

interface BlogEditorProps {
  post?: BlogPost;
  onSave: () => void;
}

export default function BlogEditor({ post, onSave }: BlogEditorProps) {
  const { play: playClick } = useSound("click");
  const [formData, setFormData] = useState<BlogPost>({
    title: post?.title || "",
    content: post?.content || "",
    excerpt: post?.excerpt || "",
    category: post?.category || "General",
    tags: post?.tags || [],
    published: post?.published || false,
    featured: post?.featured || false,
    seoTitle: post?.seoTitle || "",
    seoDescription: post?.seoDescription || "",
    coverImage: post?.coverImage || "",
  });

  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<{ available: boolean; message?: string } | null>(null);
  const [showPromptComposer, setShowPromptComposer] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      const response = await fetch("/api/llm/status");
      const data = await response.json();
      setAiStatus(data);
    } catch (error) {
      setAiStatus({ available: false, message: "Unable to check AI status" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    playClick();

    try {
      const url = post?._id ? `/api/blog/${post.slug}` : "/api/blog";
      const method = post?._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSave();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save post");
      }
    } catch (error: any) {
      alert(error.message || "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const formatText = async (content: string): Promise<string> => {
    try {
      const response = await fetch("/api/blog/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "format-text",
          content: content,
        }),
      });

      if (!response.ok) {
        // If formatting fails, return original content
        console.warn("Text formatting failed, using original content");
        return content;
      }

      const data = await response.json();
      return data.content || content;
    } catch (error) {
      // If formatting fails, return original content
      console.warn("Text formatting error, using original content:", error);
      return content;
    }
  };

  const handleAIAction = async (action: string, options?: any) => {
    setAiLoading(true);
    playClick();

    try {
      let payload: any = { action };

      if (action === "generate-full") {
        payload = {
          action: "generate-full",
          topic: options.topic,
          tone: options.tone || "professional",
          generateMetadata: options.generateMetadata !== false,
        };
      } else if (action === "improve") {
        payload = {
          action: "improve",
          content: formData.content,
          instruction: options.instruction,
          tone: options.tone,
        };
      } else if (action === "custom") {
        payload = {
          action: "custom",
          customPrompt: options.prompt,
          systemPrompt: options.systemPrompt,
          maxTokens: options.maxTokens,
          temperature: options.temperature,
        };
      } else {
        // Legacy actions
        return handleAIGenerate(action as any, options?.prompt, options?.systemPrompt, options);
      }

      const response = await fetch("/api/blog/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (action === "generate-full") {
        // Format the generated content
        const formattedContent = await formatText(data.content || formData.content);
        // Update all fields from the generated blog post
        setFormData({
          ...formData,
          title: data.title || formData.title,
          content: formattedContent,
          excerpt: data.excerpt || formData.excerpt,
          category: data.category || formData.category,
          tags: data.tags || formData.tags,
          seoTitle: data.seoTitle || formData.seoTitle,
          seoDescription: data.seoDescription || formData.seoDescription,
          coverImage: data.coverImage || formData.coverImage,
        });
      } else if (action === "improve" || action === "custom") {
        // Format the improved/custom generated content
        const formattedContent = await formatText(data.content);
        setFormData({ ...formData, content: formattedContent });
      }
    } catch (error: any) {
      console.error("AI generation error:", error);
      const errorMessage = error.message || "AI generation failed";
      alert(errorMessage + "\n\nPlease check:\n- LLM is configured correctly in /MonyAdmin/llm\n- Ollama is running (if using Ollama)\n- Model is available (run: ollama pull <model-name>)");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIGenerate = async (action: "generate" | "improve" | "excerpt" | "tags" | "custom", customPrompt?: string, systemPrompt?: string, options?: { maxTokens?: number; temperature?: number }) => {
    setAiLoading(true);
    playClick();

    try {
      let response;
      const payload: any = { action };

      switch (action) {
        case "generate":
          const topic = prompt("Enter the topic for your blog post:");
          if (!topic) {
            setAiLoading(false);
            return;
          }
          payload.topic = topic;
          payload.style = "professional";
          break;
        case "improve":
          const instruction = prompt("How would you like to improve the content?");
          if (!instruction || !formData.content) {
            setAiLoading(false);
            return;
          }
          payload.content = formData.content;
          payload.instruction = instruction;
          break;
        case "excerpt":
          if (!formData.content) {
            alert("Please add some content first");
            setAiLoading(false);
            return;
          }
          payload.content = formData.content;
          break;
        case "tags":
          if (!formData.content) {
            alert("Please add some content first");
            setAiLoading(false);
            return;
          }
          payload.content = formData.content;
          break;
        case "custom":
          if (!customPrompt) {
            setAiLoading(false);
            return;
          }
          payload.customPrompt = customPrompt;
          if (systemPrompt) payload.systemPrompt = systemPrompt;
          if (options?.maxTokens) payload.maxTokens = options.maxTokens;
          if (options?.temperature !== undefined) payload.temperature = options.temperature;
          break;
      }

      response = await fetch("/api/blog/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (action === "generate" || action === "improve" || action === "custom") {
        // Format the generated content
        const formattedContent = await formatText(data.content);
        setFormData({ ...formData, content: formattedContent });
      } else if (action === "excerpt") {
        setFormData({ ...formData, excerpt: data.content });
      } else if (action === "tags") {
        const newTags = data.content.split(",").map((t: string) => t.trim()).filter(Boolean);
        setFormData({ ...formData, tags: [...new Set([...formData.tags, ...newTags])] });
      }
    } catch (error: any) {
      console.error("AI generation error:", error);
      const errorMessage = error.message || "AI generation failed";
      alert(errorMessage + "\n\nPlease check:\n- LLM is configured correctly in /MonyAdmin/llm\n- Ollama is running (if using Ollama)\n- Model is available (run: ollama pull <model-name>)");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCustomPrompt = async (prompt: string, systemPrompt?: string, options?: { maxTokens?: number; temperature?: number }) => {
    await handleAIGenerate("custom", prompt, systemPrompt, options);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI Status Banner */}
      {aiStatus && (
        <motion.div
          className={`p-4 rounded-lg border ${
            aiStatus.available
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
              : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
          }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
                {aiStatus.available ? "✓ AI Assistant Available" : "⚠ AI Assistant Unavailable"}
              </p>
              <p className="text-sm mt-1">
                {aiStatus.available
                  ? `You can use AI to generate and improve blog content (${aiStatus.provider || 'LLM'})`
                  : aiStatus.message || "LLM is not configured. Go to /MonyAdmin/llm to configure."}
              </p>
            </div>
            {!aiStatus.available && (
              <a
                href="/MonyAdmin/llm"
                className="text-sm underline"
              >
                Configure LLM
              </a>
            )}
          </div>
        </motion.div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter blog post title"
        />
      </div>

      {/* Content with AI Tools */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Content (Rich Markdown Editor) *
          </label>
          {aiStatus?.available && (
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowAIAssistant(true)}
                disabled={aiLoading}
                className="px-3 py-1 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 font-semibold"
              >
                ✨ AI Assistant
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!formData.content.trim()) {
                    alert("Please add some content first to format");
                    return;
                  }
                  setAiLoading(true);
                  try {
                    const response = await fetch("/api/blog/ai/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "format-text",
                        content: formData.content,
                      }),
                    });
                    const data = await response.json();
                    if (response.ok && data.content) {
                      setFormData({ ...formData, content: data.content });
                    } else {
                      alert(data.error || "Failed to format text");
                    }
                  } catch (error: any) {
                    alert(error.message || "Failed to format text");
                  } finally {
                    setAiLoading(false);
                  }
                }}
                disabled={aiLoading || !formData.content.trim()}
                className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 disabled:opacity-50 font-semibold"
                title="Format and clean up the existing text with proper markdown, paragraphs, and headers"
              >
                {aiLoading ? "⏳ Formatting..." : "✨ Format & Clean Text"}
              </button>
              <button
                type="button"
                onClick={() => setShowPromptComposer(true)}
                disabled={aiLoading}
                className="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 disabled:opacity-50"
              >
                Custom Prompt
              </button>
            </div>
          )}
        </div>
        <RichMarkdownEditor
          content={formData.content}
          onChange={(content) => setFormData({ ...formData, content })}
          placeholder="Write your blog post content..."
        />
      </div>

      {/* Excerpt with AI */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Excerpt
          </label>
          {aiStatus?.available && (
            <button
              type="button"
              onClick={() => handleAIGenerate("excerpt")}
              disabled={aiLoading || !formData.content}
              className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 disabled:opacity-50"
            >
              {aiLoading ? "Generating..." : "🤖 Generate Excerpt"}
            </button>
          )}
        </div>
        <textarea
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Brief excerpt (auto-generated if empty)"
        />
      </div>

      {/* Category and Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            {aiStatus?.available && (formData.title || formData.content) && (
              <button
                type="button"
                onClick={async () => {
                  setAiLoading(true);
                  try {
                    const response = await fetch("/api/blog/ai/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "generate-category",
                        title: formData.title,
                        content: formData.content.substring(0, 500),
                      }),
                    });
                    const data = await response.json();
                    if (response.ok && data.category) {
                      setFormData((prev) => ({ ...prev, category: data.category }));
                    }
                  } catch (error) {
                    alert("Failed to generate category");
                  } finally {
                    setAiLoading(false);
                  }
                }}
                disabled={aiLoading}
                className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 disabled:opacity-50"
              >
                {aiLoading ? "..." : "🤖 AI"}
              </button>
            )}
          </div>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="General"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags {aiStatus?.available && (
              <button
                type="button"
                onClick={() => handleAIGenerate("tags")}
                disabled={aiLoading || !formData.content}
                className="ml-2 px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 disabled:opacity-50"
              >
                {aiLoading ? "..." : "🤖 AI"}
              </button>
            )}
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add tag and press Enter"
            />
            <AnimatedButton type="button" onClick={handleAddTag} variant="secondary" className="px-4">
              Add
            </AnimatedButton>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-600 dark:hover:text-blue-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SEO Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              SEO Title
            </label>
            {aiStatus?.available && (formData.title || formData.content) && (
              <button
                type="button"
                onClick={async () => {
                  setAiLoading(true);
                  try {
                    const response = await fetch("/api/blog/ai/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "generate-seo-title",
                        title: formData.title,
                        content: formData.content.substring(0, 500),
                      }),
                    });
                    const data = await response.json();
                    if (response.ok && data.seoTitle) {
                      setFormData((prev) => ({ ...prev, seoTitle: data.seoTitle }));
                    }
                  } catch (error) {
                    alert("Failed to generate SEO title");
                  } finally {
                    setAiLoading(false);
                  }
                }}
                disabled={aiLoading}
                className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 disabled:opacity-50"
              >
                {aiLoading ? "..." : "🤖 AI"}
              </button>
            )}
          </div>
          <input
            type="text"
            value={formData.seoTitle}
            onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="SEO optimized title"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              SEO Description
            </label>
            {aiStatus?.available && (formData.title || formData.content) && (
              <button
                type="button"
                onClick={async () => {
                  setAiLoading(true);
                  try {
                    const response = await fetch("/api/blog/ai/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "generate-seo-description",
                        title: formData.title,
                        content: formData.content.substring(0, 500),
                      }),
                    });
                    const data = await response.json();
                    if (response.ok && data.seoDescription) {
                      setFormData((prev) => ({ ...prev, seoDescription: data.seoDescription }));
                    }
                  } catch (error) {
                    alert("Failed to generate SEO description");
                  } finally {
                    setAiLoading(false);
                  }
                }}
                disabled={aiLoading}
                className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 disabled:opacity-50"
              >
                {aiLoading ? "..." : "🤖 AI"}
              </button>
            )}
          </div>
          <input
            type="text"
            value={formData.seoDescription}
            onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="SEO meta description"
          />
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cover Image
        </label>
        <div className="space-y-2">
          <input
            type="url"
            value={formData.coverImage}
            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg or upload an image"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;

                  try {
                    const formData = new FormData();
                    formData.append("file", file);

                    const response = await fetch("/api/upload", {
                      method: "POST",
                      body: formData,
                    });

                    if (!response.ok) {
                      throw new Error("Upload failed");
                    }

                    const data = await response.json();
                    setFormData((prev) => ({ ...prev, coverImage: data.url }));
                  } catch (error: any) {
                    alert(error.message || "Failed to upload image");
                  }
                };
                input.click();
              }}
              className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 text-sm"
            >
              📤 Upload Image
            </button>
            {aiStatus?.available && (
              <button
                type="button"
                onClick={async () => {
                  if (!formData.title && !formData.content) {
                    alert("Please add a title or content first to generate a cover image suggestion");
                    return;
                  }
                  setAiLoading(true);
                  try {
                    const response = await fetch("/api/blog/ai/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "suggest-cover-image",
                        title: formData.title,
                        content: formData.content.substring(0, 500),
                      }),
                    });
                    const data = await response.json();
                    if (response.ok && data.coverImageUrl) {
                      setFormData((prev) => ({ ...prev, coverImage: data.coverImageUrl }));
                    } else {
                      alert("Could not generate cover image suggestion. Please provide a URL manually.");
                    }
                  } catch (error) {
                    alert("Failed to generate cover image suggestion");
                  } finally {
                    setAiLoading(false);
                  }
                }}
                disabled={aiLoading}
                className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 disabled:opacity-50 text-sm"
              >
                {aiLoading ? "..." : "🤖 Suggest Image"}
              </button>
            )}
          </div>
          {formData.coverImage && (
            <div className="mt-2">
              <img
                src={formData.coverImage}
                alt="Cover preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-800"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Published</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
        <AnimatedButton
          type="button"
          onClick={() => window.history.back()}
          variant="secondary"
        >
          Cancel
        </AnimatedButton>
        <AnimatedButton type="submit" variant="primary" disabled={loading}>
          {loading ? "Saving..." : post?._id ? "Update Post" : "Create Post"}
        </AnimatedButton>
      </div>

      {/* AI Assistant Modal */}
      {showAIAssistant && aiStatus?.available && (
        <AIAssistant
          onAction={handleAIAction}
          onClose={() => setShowAIAssistant(false)}
          available={aiStatus.available}
          hasContent={!!formData.content}
        />
      )}

      {/* AI Prompt Composer Modal */}
      {showPromptComposer && aiStatus?.available && (
        <AIPromptComposer
          onGenerate={handleCustomPrompt}
          onClose={() => setShowPromptComposer(false)}
          available={aiStatus.available}
        />
      )}
    </form>
  );
}

