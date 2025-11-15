"use client";

import { useEffect, useState } from "react";
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
  sortPriority: number;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sorted = [...projects].sort((a, b) => (b.sortPriority || 0) - (a.sortPriority || 0));
    const oldIndex = sorted.findIndex((p) => p._id === active.id);
    const newIndex = sorted.findIndex((p) => p._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder the array
    const [movedItem] = sorted.splice(oldIndex, 1);
    sorted.splice(newIndex, 0, movedItem);

    // Update priorities based on new positions (highest priority = first position)
    const items = sorted.map((project, index) => ({
      id: project._id,
      order: sorted.length - index,
    }));

    try {
      const response = await fetch("/api/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (response.ok) {
        fetchProjects();
      } else {
        alert("Failed to reorder projects");
      }
    } catch (error) {
      console.error("Error reordering projects:", error);
      alert("Failed to reorder projects");
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={[...projects].sort((a, b) => (b.sortPriority || 0) - (a.sortPriority || 0)).map((p) => p._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {projects.length > 0 ? (
                  [...projects].sort((a, b) => (b.sortPriority || 0) - (a.sortPriority || 0)).map((project, index) => (
                    <SortableProjectItem key={project._id} id={project._id} project={project} index={index} total={projects.length} onEdit={() => router.push(`/MonyAdmin/projects/${project.slug}`)} onDelete={() => handleDelete(project.slug)} />
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
            </SortableContext>
          </DndContext>
        )}
      </main>
    </div>
  );
}

function SortableProjectItem({ id, project, index, total, onEdit, onDelete }: { id: string; project: Project; index: number; total: number; onEdit: () => void; onDelete: () => void }) {
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="cursor-grab active:cursor-grabbing flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors" {...attributes} {...listeners} title="Drag to reorder">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
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

