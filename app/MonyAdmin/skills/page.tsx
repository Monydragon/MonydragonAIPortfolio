"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import Link from "next/link";

interface Skill {
  _id: string;
  name: string;
  category: string;
  order: number;
}

interface SkillCategory {
  _id: string;
  value: string;
  label: string;
  color?: string;
  order: number;
}

const COLOR_OPTIONS = [
  "blue",
  "purple",
  "pink",
  "amber",
  "green",
  "indigo",
  "red",
  "teal",
  "gray",
];

export default function AdminSkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "" as string,
    order: 0,
  });
  const [categoryEditing, setCategoryEditing] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<{
    value: string;
    label: string;
    color: string;
    order: number;
  }>({
    value: "",
    label: "",
    color: "blue",
    order: 0,
  });
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [showResumePicker, setShowResumePicker] = useState(false);
  const [resumeSources, setResumeSources] = useState<{ _id: string; name: string }[]>([]);
  const [selectedResumeSourceId, setSelectedResumeSourceId] = useState<string | "all">("all");

  useEffect(() => {
    fetchCategories();
    fetchSkills();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/skills/categories");
      const data = await response.json();

      if (response.ok) {
        const fetched: SkillCategory[] = data.categories || [];
        // Fallback default categories if DB is empty
        if (!fetched.length) {
          const defaults: SkillCategory[] = [
            { _id: "languages", value: "languages", label: "Languages", color: "blue", order: 0 },
            { _id: "frameworks", value: "frameworks", label: "Frameworks", color: "purple", order: 1 },
            { _id: "tools", value: "tools", label: "Tools", color: "pink", order: 2 },
            { _id: "ai", value: "ai", label: "AI", color: "amber", order: 3 },
            { _id: "development", value: "development", label: "Development", color: "green", order: 4 },
            { _id: "architecture", value: "architecture", label: "Architecture", color: "indigo", order: 5 },
          ];
          setCategories(defaults);
          // Do not auto-seed DB here to keep side effects explicit
        } else {
          setCategories(fetched);
        }
      }
    } catch (error) {
      console.error("Error fetching skill categories:", error);
    }
  };

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

      if (!body.category) {
        alert("Please select a category");
        return;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setEditing(null);
        setShowAddForm(false);
        setFormData({ name: "", category: categories[0]?.value || "", order: 0 });
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
    setFormData({ name: "", category: categories[0]?.value || "", order: 0 });
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

  const getCategoryDisplay = (value: string) => {
    const match = categories.find((c) => c.value === value);
    return (
      match || {
        _id: value,
        value,
        label: value,
        color: "gray",
        order: 999,
      }
    );
  };

  const handleCategoryEdit = (category: SkillCategory) => {
    setCategoryEditing(category._id);
    setCategoryForm({
      value: category.value,
      label: category.label,
      color: category.color || "blue",
      order: category.order,
    });
  };

  const handleCategoryCancel = () => {
    setCategoryEditing(null);
    setCategoryForm({
      value: "",
      label: "",
      color: "blue",
      order: 0,
    });
  };

  const handleCategorySave = async () => {
    try {
      const method = categoryEditing ? "PUT" : "POST";
      const url = "/api/skills/categories";
      const body = categoryEditing
        ? { ...categoryForm, id: categoryEditing }
        : categoryForm;

      if (!body.value || !body.label) {
        alert("Value and label are required");
        return;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setCategoryEditing(null);
        setCategoryForm({
          value: "",
          label: "",
          color: "blue",
          order: 0,
        });
        await fetchCategories();
        // Ensure skill form has a valid category
        setFormData((prev) => ({
          ...prev,
          category: prev.category || categories[0]?.value || "",
        }));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category");
    }
  };

  const handleCategoryDelete = async (id: string) => {
    if (!confirm("Delete this category? Existing skills will keep their category string, but it will no longer be listed here.")) {
      return;
    }

    try {
      const response = await fetch(`/api/skills/categories?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };

  const loadResumeSkills = async () => {
    try {
      setShowResumePicker(true);
      if (resumeSkills.length > 0 && resumeSources.length > 0) {
        return;
      }
      setResumeLoading(true);
      const [sourcesRes, skillsRes] = await Promise.all([
        fetch("/api/skills/resume-sources"),
        fetch("/api/skills/sources"),
      ]);
      const sourcesData = await sourcesRes.json();
      const skillsData = await skillsRes.json();

      if (sourcesRes.ok) {
        const simpleSources =
          (sourcesData.sources || []).map((s: any) => ({ _id: s._id, name: s.name })) ?? [];
        setResumeSources(simpleSources);
      }

      if (skillsRes.ok) {
        const all: string[] = skillsData.all || [];
        setResumeSkills(all);
      } else {
        alert(skillsData.error || "Failed to load resume skills");
      }
    } catch (error) {
      console.error("Error loading resume skills:", error);
      alert("Failed to load resume skills");
    } finally {
      setResumeLoading(false);
    }
  };

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
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Manage Skills
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Edit your skill categories and individual skills
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
        {/* Category Management */}
        <AnimatedCard className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Skill Categories</h2>
            {!categoryEditing && (
              <AnimatedButton
                variant="secondary"
                onClick={() => {
                  setCategoryEditing(null);
                  setCategoryForm({
                    value: "",
                    label: "",
                    color: "blue",
                    order: 0,
                  });
                }}
              >
                Add Category
              </AnimatedButton>
            )}
          </div>

          {(categoryEditing !== null || categoryForm.value || categoryForm.label) && (
            <div className="mb-6 space-y-4 border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/40">
              <h3 className="font-semibold mb-2">
                {categoryEditing ? "Edit Category" : "New Category"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Value (key)</label>
                  <input
                    type="text"
                    value={categoryForm.value}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, value: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    placeholder="e.g. languages"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Label</label>
                  <input
                    type="text"
                    value={categoryForm.label}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, label: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    placeholder="e.g. Languages"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <select
                    value={categoryForm.color}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, color: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                  >
                    {COLOR_OPTIONS.map((color) => (
                      <option key={color} value={color}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Order</label>
                  <input
                    type="number"
                    value={categoryForm.order}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        order: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <AnimatedButton variant="primary" onClick={handleCategorySave}>
                  {categoryEditing ? "Update Category" : "Create Category"}
                </AnimatedButton>
                <AnimatedButton variant="secondary" onClick={handleCategoryCancel}>
                  Cancel
                </AnimatedButton>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {categories
              .slice()
              .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
              .map((cat) => (
                <div
                  key={cat._id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{cat.label}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({cat.value})
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      order: {cat.order}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCategoryEdit(cat)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCategoryDelete(cat._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            {categories.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No categories yet. Create one above to start organizing skills.
              </p>
            )}
          </div>
        </AnimatedCard>

        {/* Resume Sources Helper (description only for now) */}
        <AnimatedCard className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Resume Sources</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Skills in the picker above are loaded from your living resume data in <code>lib/resume.ts</code>{" "}
            and any parsed resume sources (added via API). This keeps the skill list aligned with your actual
            experience. If you want, we can later add a UI here to paste or upload new resumes that feed into
            the picker.
          </p>
        </AnimatedCard>

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
                <div className="mt-2 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={loadResumeSkills}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    disabled={resumeLoading}
                  >
                    {resumeLoading ? "Loading resume skills..." : "Pick from resume / technologies"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800"
                >
                  <option value="">Select category</option>
                  {categories
                    .slice()
                    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
                    .map((cat) => (
                      <option key={cat._id} value={cat.value}>
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

        {/* Resume Skill Picker Overlay */}
        {showResumePicker && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-xl w-full max-h-[70vh] overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold">Insert skill from resume / technologies</h3>
                  {resumeSources.length > 0 && (
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span>Source:</span>
                      <select
                        value={selectedResumeSourceId}
                        onChange={(e) => setSelectedResumeSourceId(e.target.value as any)}
                        className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                      >
                        <option value="all">All</option>
                        {resumeSources.map((src) => (
                          <option key={src._id} value={src._id}>
                            {src.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowResumePicker(false)}
                  className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                {resumeSkills.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No suggestions found in your resume data.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {resumeSkills.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, name }));
                          setShowResumePicker(false);
                        }}
                        className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-800 dark:text-gray-100 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Skills by Category */}
        <div className="space-y-6">
          {categories
            .slice()
            .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
            .map((category) => {
              const categorySkills = groupedSkills[category.value] || [];
              if (categorySkills.length === 0 && !showAddForm && !editing) return null;

              const color = category.color || "blue";
              const colorBadgeClass = `px-3 py-1 bg-${color}-100 dark:bg-${color}-900 text-${color}-800 dark:text-${color}-200 rounded-full text-sm`;

              return (
                <AnimatedCard key={category._id}>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className={colorBadgeClass}>
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

          {/* Any skills whose category doesn't have a matching category record */}
          {Object.entries(groupedSkills)
            .filter(([categoryValue]) => !categories.find((c) => c.value === categoryValue))
            .map(([categoryValue, categorySkills]) => (
              <AnimatedCard key={categoryValue}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                    {categoryValue}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    ({categorySkills.length})
                  </span>
                </h2>
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
              </AnimatedCard>
            ))}
        </div>
      </main>
    </div>
  );
}

