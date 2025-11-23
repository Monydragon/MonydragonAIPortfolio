"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import Link from "next/link";
import { RichMarkdownEditor } from "@/components/admin/RichMarkdownEditor";

export default function NewContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    key: "",
    content: "",
  });
  const [isJsonMode, setIsJsonMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // If in JSON mode, try to parse as JSON, otherwise store as string/markdown
      let parsedContent: any = formData.content;
      if (isJsonMode) {
        try {
          parsedContent = JSON.parse(formData.content);
        } catch {
          alert("Content is not valid JSON");
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: formData.key,
          content: parsedContent,
        }),
      });

      if (response.ok) {
        router.push("/MonyAdmin/content");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create content");
      }
    } catch (error) {
      console.error("Error creating content:", error);
      alert("Failed to create content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/MonyAdmin/content" className="text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block">
            ← Back to Content
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            New Site Content
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <div>
            <label className="block text-sm font-medium mb-2">Key *</label>
            <input
              type="text"
              required
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              placeholder="about_summary, about_story, skills, etc."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            />
            <p className="text-xs text-gray-500 mt-1">Unique identifier for this content (e.g., about_summary)</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Content *</label>
              <button
                type="button"
                onClick={() => setIsJsonMode(!isJsonMode)}
                className="text-xs px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isJsonMode ? "Switch to Rich Editor" : "Switch to JSON Editor"}
              </button>
            </div>

            {isJsonMode ? (
              <>
                <textarea
                  required
                  rows={12}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder='Enter JSON. Example: {"title": "About Me"}'
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Enter valid JSON for structured content.</p>
              </>
            ) : (
              <>
                <RichMarkdownEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Write this section using rich markdown (headings, paragraphs, lists, etc.)"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Content will be stored as a markdown string.
                </p>
              </>
            )}
          </div>

          <div className="flex gap-4">
            <AnimatedButton type="submit" variant="primary" disabled={loading}>
              {loading ? "Creating..." : "Create Content"}
            </AnimatedButton>
            <AnimatedButton type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </AnimatedButton>
          </div>
        </form>
      </main>
    </div>
  );
}

