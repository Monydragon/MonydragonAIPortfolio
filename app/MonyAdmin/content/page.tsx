"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import Link from "next/link";

interface SiteContent {
  _id: string;
  key: string;
  content: any;
  updatedAt: string;
}

export default function AdminContentPage() {
  const router = useRouter();
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/content");
      const data = await response.json();

      if (response.ok) {
        setContents(data.contents || []);
      }
    } catch (error) {
      console.error("Error fetching site content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;

    try {
      const response = await fetch(`/api/content/${key}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchContents();
      } else {
        alert("Failed to delete content");
      }
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("Failed to delete content");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/MonyAdmin" className="text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Site Content Management
              </h1>
            </div>
            <AnimatedButton onClick={() => router.push("/MonyAdmin/content/new")} variant="primary">
              + New Content
            </AnimatedButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading content...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contents.length > 0 ? (
              contents.map((content, index) => (
                <AnimatedCard key={content._id} delay={index * 0.05}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {content.key}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {typeof content.content === "string"
                          ? content.content.substring(0, 200) + (content.content.length > 200 ? "..." : "")
                          : JSON.stringify(content.content).substring(0, 200) + "..."}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Last updated: {new Date(content.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AnimatedButton
                        onClick={() => router.push(`/MonyAdmin/content/${content.key}`)}
                        variant="secondary"
                        className="px-4 py-2 text-sm"
                      >
                        Edit
                      </AnimatedButton>
                      <button
                        onClick={() => handleDelete(content.key)}
                        className="px-4 py-2 text-sm bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </AnimatedCard>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No site content yet.</p>
                <AnimatedButton onClick={() => router.push("/MonyAdmin/content/new")} variant="primary">
                  Create Your First Content Entry
                </AnimatedButton>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

