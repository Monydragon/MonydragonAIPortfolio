"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import Link from "next/link";
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

interface Experience {
  _id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  order: number;
}

export default function AdminExperiencePage() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/experience");
      const data = await response.json();

      if (response.ok) {
        setExperiences(data.experiences || []);
      }
    } catch (error) {
      console.error("Error fetching experiences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience entry?")) return;

    try {
      const response = await fetch(`/api/experience/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchExperiences();
      } else {
        alert("Failed to delete experience");
      }
    } catch (error) {
      console.error("Error deleting experience:", error);
      alert("Failed to delete experience");
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sorted = [...experiences].sort((a, b) => b.order - a.order);
    const oldIndex = sorted.findIndex((exp) => exp._id === active.id);
    const newIndex = sorted.findIndex((exp) => exp._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder the array
    const [movedItem] = sorted.splice(oldIndex, 1);
    sorted.splice(newIndex, 0, movedItem);

    // Update orders based on new positions (highest order = first position)
    const items = sorted.map((exp, index) => ({
      id: exp._id,
      order: sorted.length - index,
    }));

    try {
      const response = await fetch("/api/experience/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (response.ok) {
        fetchExperiences();
      } else {
        alert("Failed to reorder experience");
      }
    } catch (error) {
      console.error("Error reordering experience:", error);
      alert("Failed to reorder experience");
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
                Experience Management
              </h1>
            </div>
            <AnimatedButton onClick={() => router.push("/MonyAdmin/experience/new")} variant="primary">
              + New Experience
            </AnimatedButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading experiences...</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={[...experiences].sort((a, b) => b.order - a.order).map((exp) => exp._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {experiences.length > 0 ? (
                  [...experiences].sort((a, b) => b.order - a.order).map((exp, index) => (
                    <SortableExperienceItem key={exp._id} id={exp._id} exp={exp} index={index} total={experiences.length} onEdit={() => router.push(`/MonyAdmin/experience/${exp._id}`)} onDelete={() => handleDelete(exp._id)} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No experience entries yet.</p>
                    <AnimatedButton onClick={() => router.push("/MonyAdmin/experience/new")} variant="primary">
                      Add Your First Experience
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

function SortableExperienceItem({ id, exp, index, total, onEdit, onDelete }: { id: string; exp: Experience; index: number; total: number; onEdit: () => void; onDelete: () => void }) {
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {exp.title}
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                {exp.company}
                {exp.location && ` • ${exp.location}`}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {exp.startDate} - {exp.current ? "Present" : exp.endDate || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AnimatedButton
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              variant="secondary"
              className="px-4 py-2 text-sm"
            >
              Edit
            </AnimatedButton>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
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

