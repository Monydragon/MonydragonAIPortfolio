"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import Link from "next/link";
import { format } from "date-fns";

interface Project {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  category: string;
  featured: boolean;
  tags: string[];
  releasedOn?: string;
  createdAt: string;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/projects");
      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(`/api/projects/${slug}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProjects();
      } else {
        alert("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project");
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
                Projects Management
              </h1>
            </div>
            <AnimatedButton onClick={() => router.push("/MonyAdmin/projects/new")} variant="primary">
              + New Project
            </AnimatedButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading projects...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <AnimatedCard key={project._id} delay={index * 0.05}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {project.featured && (
                          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded text-xs font-semibold">
                            Featured
                          </span>
                        )}
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs font-semibold">
                          {project.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {project.title}
                      </h3>
                      {project.subtitle && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {project.subtitle}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                        {project.releasedOn && (
                          <span>Released {format(new Date(project.releasedOn), "MMM d, yyyy")}</span>
                        )}
                        <span>Created {format(new Date(project.createdAt), "MMM d, yyyy")}</span>
                      </div>
                      {project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.tags.slice(0, 5).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <AnimatedButton
                        onClick={() => router.push(`/MonyAdmin/projects/${project.slug}`)}
                        variant="secondary"
                        className="px-4 py-2 text-sm"
                      >
                        Edit
                      </AnimatedButton>
                      <button
                        onClick={() => handleDelete(project.slug)}
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
                <p className="text-gray-600 dark:text-gray-400 mb-4">No projects yet.</p>
                <AnimatedButton onClick={() => router.push("/MonyAdmin/projects/new")} variant="primary">
                  Create Your First Project
                </AnimatedButton>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

