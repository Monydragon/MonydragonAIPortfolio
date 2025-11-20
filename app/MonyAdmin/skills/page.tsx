"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import Link from "next/link";

interface Skill {
  _id: string;
  name: string;
  category: 'languages' | 'frameworks' | 'tools' | 'ai' | 'development' | 'architecture';
  order: number;
}

const CATEGORIES = [
  { value: 'languages', label: 'Languages', color: 'blue' },
  { value: 'frameworks', label: 'Frameworks', color: 'purple' },
  { value: 'tools', label: 'Tools', color: 'pink' },
  { value: 'ai', label: 'AI', color: 'amber' },
  { value: 'development', label: 'Development', color: 'green' },
  { value: 'architecture', label: 'Architecture', color: 'indigo' },
];

export default function AdminSkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "languages" as Skill['category'],
    order: 0,
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/skills");
      const data = await response.json();

      if (response.ok) {
        // Flatten grouped skills back to array
        const raw = data.raw || [];
        setSkills(raw);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    try {
      const response = await fetch(`/api/skills?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchSkills();
      } else {
        alert("Failed to delete skill");
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
      alert("Failed to delete skill");
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditing(skill._id);
    setFormData({
      name: skill.name,
      category: skill.category,
      order: skill.order,
    });
    setShowAddForm(false);
  };

  const handleSave = async () => {
    try {
      const url = editing ? "/api/skills" : "/api/skills";
      const method = editing ? "PUT" : "POST";
      const body = editing ? { ...formData, id: editing } : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setEditing(null);
        setShowAddForm(false);
        setFormData({ name: "", category: "languages", order: 0 });
        fetchSkills();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save skill");
      }
    } catch (error) {
      console.error("Error saving skill:", error);
      alert("Failed to save skill");
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setShowAddForm(false);
    setFormData({ name: "", category: "languages", order: 0 });
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Sort each category by order
  Object.keys(groupedSkills).forEach((cat) => {
    groupedSkills[cat].sort((a, b) => b.order - a.order);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Manage Skills
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Edit your skills and expertise
              </p>
            </div>
            <div className="flex gap-2">
              {!showAddForm && !editing && (
                <AnimatedButton onClick={() => setShowAddForm(true)} variant="primary">
                  Add Skill
                </AnimatedButton>
              )}
              <Link href="/MonyAdmin">
                <AnimatedButton variant="secondary">Back to Dashboard</AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Add/Edit Form */}
        {(showAddForm || editing) && (
          <AnimatedCard className="mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editing ? "Edit Skill" : "Add New Skill"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Skill Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                  placeholder="e.g., TypeScript, React, Docker"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Skill['category'] })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Order (higher = appears first)</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                />
              </div>
              <div className="flex gap-2">
                <AnimatedButton onClick={handleSave} variant="primary">
                  {editing ? "Update" : "Add"} Skill
                </AnimatedButton>
                <AnimatedButton onClick={handleCancel} variant="secondary">
                  Cancel
                </AnimatedButton>
              </div>
            </div>
          </AnimatedCard>
        )}

        {/* Skills by Category */}
        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const categorySkills = groupedSkills[category.value] || [];
            if (categorySkills.length === 0 && !showAddForm && !editing) return null;

            return (
              <AnimatedCard key={category.value}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className={`px-3 py-1 bg-${category.color}-100 dark:bg-${category.color}-900 text-${category.color}-800 dark:text-${category.color}-200 rounded-full text-sm`}>
                    {category.label}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    ({categorySkills.length})
                  </span>
                </h2>
                {categorySkills.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No skills in this category</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <div
                        key={skill._id}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full"
                      >
                        <span>{skill.name}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(skill)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(skill._id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AnimatedCard>
            );
          })}
        </div>
      </main>
    </div>
  );
}

