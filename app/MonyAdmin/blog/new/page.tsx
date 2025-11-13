"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import dynamic from "next/dynamic";

// Dynamically import the editor to avoid SSR issues
const BlogEditor = dynamic(() => import("@/components/admin/BlogEditor"), {
  ssr: false,
});

export default function NewBlogPostPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push("/MonyAdmin/blog")}
                className="text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block"
              >
                ← Back to Blog
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                New Blog Post
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <BlogEditor onSave={() => router.push("/MonyAdmin/blog")} />
      </main>
    </div>
  );
}

