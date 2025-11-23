"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import Link from "next/link";
import { RichMarkdownEditor } from "@/components/admin/RichMarkdownEditor";

export default function EditContentPage() {
  const router = useRouter();
  const params = useParams();
  const key = params?.key as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    content: "",
  });
  const [isJsonMode, setIsJsonMode] = useState(false);

  const fetchContent = useCallback(async () => {
    try {
      const response = await fetch(`/api/content/${key}`);
      if (response.ok) {
        const content = await response.json();
        // Format content for display
        if (typeof content.content === "string") {
          setFormData({ content: content.content });
          setIsJsonMode(false);
        } else {
          setFormData({ content: JSON.stringify(content.content, null, 2) });
          setIsJsonMode(true);
        }
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    if (key) {
      fetchContent();
    }
  }, [key, fetchContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // If in JSON mode, try to parse as JSON, otherwise store as string/markdown
      let parsedContent: any = formData.content;
      if (isJsonMode) {
        try {
          parsedContent = JSON.parse(formData.content);
        } catch {
          alert("Content is not valid JSON");
          setSaving(false);
          return;
        }
      }

      const response = await fetch(`/api/content/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: parsedContent,
        }),
      });

      if (response.ok) {
        router.push("/MonyAdmin/content");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update content");
      }
    } catch (error) {
      console.error("Error updating content:", error);
      alert("Failed to update content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/MonyAdmin/content" className="text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block">
            ← Back to Content
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Content: {key}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
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
                  rows={16}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Enter valid JSON (will be stored as structured content).</p>
              </>
            ) : (
              <>
                <RichMarkdownEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Edit this section content with rich markdown..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Content will be stored as markdown string.
                </p>
              </>
            )}
          </div>

          <div className="flex gap-4">
            <AnimatedButton type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
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

