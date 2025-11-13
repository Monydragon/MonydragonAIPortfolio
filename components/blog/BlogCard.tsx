"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import { AnimatedCard } from "@/components/ui/AnimatedCard";

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

interface BlogCardProps {
  post: BlogPost;
  delay?: number;
}

export function BlogCard({ post, delay = 0 }: BlogCardProps) {
  const publishedDate = post.publishedAt 
    ? format(new Date(post.publishedAt), 'MMM d, yyyy')
    : null;

  return (
    <AnimatedCard delay={delay}>
      <Link href={`/blog/${post.slug}`}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold uppercase tracking-wide">
                  {post.category}
                </span>
                {post.featured && (
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full text-xs font-semibold">
                    Featured
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {post.title}
              </h3>
            </div>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
              {publishedDate && <span>{publishedDate}</span>}
              <span>{post.views} views</span>
            </div>
            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              Read more →
            </span>
          </div>
        </div>
      </Link>
    </AnimatedCard>
  );
}

