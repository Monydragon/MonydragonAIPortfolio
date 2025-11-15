"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import Link from "next/link";
import { format } from "date-fns";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  category: string;
  tags: string[];
  publishedAt?: string;
  views: number;
  createdAt: string;
  order: number;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/blog");
      const data = await response.json();

      if (response.ok) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/blog/${slug}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchPosts();
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sorted = [...posts].sort((a, b) => (b.order || 0) - (a.order || 0));
    const oldIndex = sorted.findIndex((p) => p._id === active.id);
    const newIndex = sorted.findIndex((p) => p._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder the array
    const [movedItem] = sorted.splice(oldIndex, 1);
    sorted.splice(newIndex, 0, movedItem);

    // Update orders based on new positions (highest order = first position)
    const items = sorted.map((post, index) => ({
      id: post._id,
      order: sorted.length - index,
    }));

    try {
      const response = await fetch("/api/blog/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (response.ok) {
        fetchPosts();
      } else {
        alert("Failed to reorder posts");
      }
    } catch (error) {
      console.error("Error reordering posts:", error);
      alert("Failed to reorder posts");
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
                Blog Management
              </h1>
            </div>
            <AnimatedButton onClick={() => router.push("/MonyAdmin/blog/new")} variant="primary">
              + New Post
            </AnimatedButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading posts...</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={[...posts].sort((a, b) => (b.order || 0) - (a.order || 0)).map((p) => p._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {posts.length > 0 ? (
                  [...posts].sort((a, b) => (b.order || 0) - (a.order || 0)).map((post, index) => (
                    <SortableBlogItem key={post._id} id={post._id} post={post} index={index} onEdit={() => router.push(`/MonyAdmin/blog/${post.slug}`)} onDelete={() => handleDelete(post.slug)} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No blog posts yet.</p>
                    <AnimatedButton onClick={() => router.push("/MonyAdmin/blog/new")} variant="primary">
                      Create Your First Post
                    </AnimatedButton>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>
    </div>
  );
}

function SortableBlogItem({ id, post, index, onEdit, onDelete }: { id: string; post: BlogPost; index: number; onEdit: () => void; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AnimatedCard delay={index * 0.05}>
        <div 
          className="flex items-start justify-between gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 p-2 -m-2 rounded-lg transition-colors"
          onClick={onEdit}
        >
          <div className="flex items-center gap-3">
            <div 
              className="cursor-grab active:cursor-grabbing flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors" 
              {...attributes} 
              {...listeners} 
              onClick={(e) => e?.stopPropagation()}
              title="Drag to reorder"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {!post.published && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs font-semibold">
                    Draft
                  </span>
                )}
                {post.featured && (
                  <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded text-xs font-semibold">
                    Featured
                  </span>
                )}
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-semibold">
                  {post.category}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {post.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                <span>{post.views} views</span>
                {post.publishedAt && (
                  <span>Published {format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
                )}
                <span>Created {format(new Date(post.createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AnimatedButton
              onClick={(e) => { e?.stopPropagation(); onEdit(); }}
              variant="secondary"
              className="px-4 py-2 text-sm"
            >
              Edit
            </AnimatedButton>
            <button
              onClick={(e) => { e?.stopPropagation(); onDelete(); }}
              className="px-4 py-2 text-sm bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}

