"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import Link from "next/link";

export default function NewContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    key: "",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Try to parse as JSON, if fails use as string
      let parsedContent;
      try {
        parsedContent = JSON.parse(formData.content);
      } catch {
        parsedContent = formData.content;
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
            <label className="block text-sm font-medium mb-2">Content *</label>
            <textarea
              required
              rows={12}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder='Enter text or JSON. For JSON: {"key": "value"}'
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Enter plain text or valid JSON</p>
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

