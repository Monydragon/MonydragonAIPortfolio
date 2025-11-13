"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import Link from "next/link";

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
          <div className="space-y-4">
            {experiences.length > 0 ? (
              experiences.map((exp, index) => (
                <AnimatedCard key={exp._id} delay={index * 0.05}>
                  <div className="flex items-start justify-between gap-4">
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
                    <div className="flex items-center gap-2">
                      <AnimatedButton
                        onClick={() => router.push(`/MonyAdmin/experience/${exp._id}`)}
                        variant="secondary"
                        className="px-4 py-2 text-sm"
                      >
                        Edit
                      </AnimatedButton>
                      <button
                        onClick={() => handleDelete(exp._id)}
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
                <p className="text-gray-600 dark:text-gray-400 mb-4">No experience entries yet.</p>
                <AnimatedButton onClick={() => router.push("/MonyAdmin/experience/new")} variant="primary">
                  Add Your First Experience
                </AnimatedButton>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

