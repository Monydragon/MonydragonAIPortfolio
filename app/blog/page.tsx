"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BlogCard } from "@/components/blog/BlogCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category: string;
  tags: string[];
  publishedAt?: string;
  views: number;
  featured: boolean;
  coverImage?: string;
  author?: {
    name: string;
    email: string;
  };
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [showFeatured, setShowFeatured] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });

      if (search) params.append("search", search);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedTag !== "all") params.append("tag", selectedTag);
      if (showFeatured) params.append("featured", "true");

      const response = await fetch(`/api/blog?${params}`);
      const data = await response.json();

      if (response.ok) {
        setPosts(data.posts || []);
        setTotalPages(data.pagination?.pages || 1);

        // Extract unique categories and tags
        const uniqueCategories = new Set<string>();
        const uniqueTags = new Set<string>();
        data.posts?.forEach((post: BlogPost) => {
          if (post.category) uniqueCategories.add(post.category);
          post.tags?.forEach((tag) => uniqueTags.add(tag));
        });
        setCategories(Array.from(uniqueCategories).sort());
        setTags(Array.from(uniqueTags).sort());
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedTag, showFeatured, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="space-y-12">
        {/* Header */}
        <motion.section
          className="text-center space-y-6 pb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Blog
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Thoughts on AI-first development, architecture, and technology
          </p>
        </motion.section>

        {/* Search and Filters */}
        <motion.section
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search blog posts..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-6 py-4 pl-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Tag Filter */}
            <select
              value={selectedTag}
              onChange={(e) => {
                setSelectedTag(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>

            {/* Featured Toggle */}
            <button
              onClick={() => {
                setShowFeatured(!showFeatured);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                showFeatured
                  ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-300"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300"
              }`}
            >
              Featured Only
            </button>
          </div>
        </motion.section>

        {/* Blog Posts */}
        <section>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading posts...</p>
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post, index) => (
                  <BlogCard key={post._id} post={post} delay={index * 0.05} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <AnimatedButton
                    onClick={() => setPage(Math.max(1, page - 1))}
                    variant="secondary"
                    disabled={page === 1}
                  >
                    Previous
                  </AnimatedButton>
                  <span className="text-gray-600 dark:text-gray-400">
                    Page {page} of {totalPages}
                  </span>
                  <AnimatedButton
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    variant="secondary"
                    disabled={page === totalPages}
                  >
                    Next
                  </AnimatedButton>
                </div>
              )}
            </>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No blog posts found. {search && "Try adjusting your search or filters."}
              </p>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
