"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

type ProjectCategory = "unity-asset" | "rpgmaker-plugin" | "game" | "web" | "other";

interface ProjectLink {
  type: string;
  label: string;
  url: string;
}

interface Project {
  _id?: string;
  title: string;
  subtitle?: string;
  category: ProjectCategory;
  description: string;
  longDescription?: string;
  technologies: string[];
  platforms: string[];
  links: ProjectLink[];
  featured?: boolean;
  tags?: string[];
  coverImage?: string;
  jam?: {
    name: string;
    url?: string;
    year?: string;
  };
  notes?: string[];
  releasedOn?: string;
  sortPriority?: number;
}

const categoryLabels: Record<ProjectCategory, string> = {
  "unity-asset": "Unity Assets",
  "rpgmaker-plugin": "RPG Maker Plugins",
  game: "Games",
  web: "Web",
  other: "Other",
};

const categoryGradients: Record<ProjectCategory, string> = {
  "unity-asset": "from-blue-500 via-blue-400 to-purple-500",
  "rpgmaker-plugin": "from-emerald-500 via-teal-400 to-sky-500",
  game: "from-pink-500 via-purple-500 to-indigo-500",
  web: "from-cyan-500 via-blue-400 to-indigo-500",
  other: "from-gray-500 via-gray-400 to-gray-600",
};

const sortProjects = (items: Project[]) => {
  return [...items].sort((a, b) => {
    const priorityDelta = (b.sortPriority ?? 0) - (a.sortPriority ?? 0);
    if (priorityDelta !== 0) return priorityDelta;

    const dateA = a.releasedOn ? new Date(a.releasedOn).getTime() : 0;
    const dateB = b.releasedOn ? new Date(b.releasedOn).getTime() : 0;
    return dateB - dateA;
  });
};

const getCategoryLabel = (category: ProjectCategory) => categoryLabels[category];

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | "all">("all");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const response = await fetch("/api/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data.projects || []);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError(err.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(projects.map((project) => project.category))),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    const base = projects.filter((project) => {
      const matchesCategory =
        selectedCategory === "all" || project.category === selectedCategory;
      const matchesFeatured = showFeaturedOnly ? project.featured : true;
      return matchesCategory && matchesFeatured;
    });

    return sortProjects(base);
  }, [projects, selectedCategory, showFeaturedOnly]);

  const featuredCount = useMemo(
    () => projects.filter((project) => project.featured).length,
    [projects]
  );

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
            Projects & Releases
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Explore Unity systems, RPG Maker plugins, and game projects built across jams,
            commissions, and passion experiments.
          </p>
        </motion.section>

        {/* Filters */}
        <section className="space-y-4">
          <div className="flex flex-wrap justify-center gap-2">
            <FilterPill
              active={selectedCategory === "all"}
              label="All"
              onClick={() => setSelectedCategory("all")}
            />
            {categories.map((category) => (
              <FilterPill
                key={category}
                active={selectedCategory === category}
                label={getCategoryLabel(category)}
                onClick={() => setSelectedCategory(category)}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setShowFeaturedOnly((prev) => !prev)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                showFeaturedOnly
                  ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-300"
                  : "border-gray-200 bg-white text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
              }`}
            >
              <span>{showFeaturedOnly ? "Showing Featured" : "Show Featured Only"}</span>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-500">
                {featuredCount}
              </span>
            </button>
          </div>
        </section>

        {/* Projects Grid */}
        <section>
          {loading ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading projects...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
            </motion.div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map((project, index) => (
                <AnimatedCard key={project._id || index} delay={index * 0.05}>
                  <ProjectCard project={project} />
                </AnimatedCard>
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No projects found for this filter. Try a different category or disable featured only.
              </p>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
        active
          ? "border-blue-500 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20"
          : "border-gray-200 bg-white text-gray-600 hover:border-blue-500 hover:text-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const categoryGradient = categoryGradients[project.category];

  return (
    <div className="space-y-5">
      {/* Category + Featured badge */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${categoryGradient} px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm`}
        >
          {getCategoryLabel(project.category)}
        </span>
        {project.featured && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-500">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Featured
          </span>
        )}
      </div>

      {/* Title & Description */}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {project.title}
        </h3>
        {project.subtitle && (
          <p className="text-sm uppercase tracking-wide text-blue-500 dark:text-blue-300">
            {project.subtitle}
          </p>
        )}
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {project.description}
        </p>
        {project.notes && (
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-500 dark:text-gray-400">
            {project.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
        <ProjectMeta title="Technologies" items={project.technologies} />
        <ProjectMeta title="Platforms" items={project.platforms} />
        {project.tags && project.tags.length > 0 && (
          <ProjectMeta title="Highlights" items={project.tags} />
        )}
        {project.jam && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Game Jam
            </h4>
            <a
              href={project.jam.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-purple-500 dark:text-blue-400"
            >
              {project.jam.name}
              {project.jam.year && <span className="text-xs text-gray-400">({project.jam.year})</span>}
            </a>
          </div>
        )}
      </div>

      {/* Links */}
      {project.links && project.links.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {project.links.map((link, linkIndex) => (
            <AnimatedButton
              key={`${project._id || project.title}-${linkIndex}-${link.url}`}
              href={link.url}
              variant="secondary"
              className="text-sm"
            >
              {link.label}
            </AnimatedButton>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectMeta({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

