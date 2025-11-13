"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { projects, Project } from "@/lib/data/projects";

const featuredSort = (items: Project[]) =>
  [...items]
    .sort((a, b) => (b.sortPriority ?? 0) - (a.sortPriority ?? 0))
    .slice(0, 3);

const externalLinkTarget = (project: Project) => {
  const primary = project.links[0];
  if (!primary) return undefined;
  const externalTypes = new Set([
    "itch",
    "asset-store",
    "github",
    "documentation",
    "website",
    "video",
  ]);
  return externalTypes.has(primary.type) ? "_blank" : undefined;
};

export default function Home() {
  const featuredProjects = useMemo(
    () => featuredSort(projects.filter((project) => project.featured)),
    []
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
      <div className="max-w-6xl w-full space-y-16">
        {/* Hero Section */}
        <motion.section
          className="space-y-6 text-center pb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Mony Dragon
          </motion.h1>

          <motion.p
            className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            AI-First Developer & Architect
          </motion.p>

          <motion.p
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Transitioning from traditional software development to AI-first workflows.
            Exploring architecture, building interactive experiences, and pushing the boundaries of modern web development.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <AnimatedButton href="/about" variant="primary">
              Learn More
            </AnimatedButton>
            <AnimatedButton href="/projects" variant="secondary">
              View Projects
            </AnimatedButton>
          </motion.div>
        </motion.section>

        {/* Quick Links */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnimatedCard href="/about" delay={0.1}>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-2">
                A
              </div>
              <h2 className="text-2xl font-bold">About</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Learn about my journey, expertise, and transition to AI-first development
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard href="/experience" delay={0.15}>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold mb-2">
                E
              </div>
              <h2 className="text-2xl font-bold">Experience</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Explore my work history across games, enterprise engineering, and leadership roles
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard href="/projects" delay={0.2}>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-2">
                P
              </div>
              <h2 className="text-2xl font-bold">Projects</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Browse systems, plugins, and games built for Unity, RPG Maker, and the web
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard href="/games" delay={0.25}>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white text-2xl font-bold mb-2">
                G
              </div>
              <h2 className="text-2xl font-bold">Games</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Play interactive experiences developed for jams, prototypes, and in-progress releases
              </p>
            </div>
          </AnimatedCard>
        </section>

        {/* Featured Projects */}
        <motion.section
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Featured Projects
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Spotlighting active releases and flagship systems available on Itch.io, the Unity Asset Store, and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((project, index) => {
              const primaryLink = project.links[0];
              const href = primaryLink?.url ?? "/projects";
              return (
                <AnimatedCard
                  key={project.id}
                  delay={0.3 + index * 0.1}
                  href={href}
                  hrefTarget={externalLinkTarget(project)}
                  hrefRel={externalLinkTarget(project) ? "noopener noreferrer" : undefined}
                >
                  <div className="space-y-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-500">
                      {project.category === "unity-asset"
                        ? "Unity Asset"
                        : project.category === "rpgmaker-plugin"
                        ? "RPG Maker Plugin"
                        : "Game"}
                    </span>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {project.title}
                      </h3>
                      {project.subtitle && (
                        <p className="text-sm uppercase tracking-wide text-purple-500 dark:text-purple-300">
                          {project.subtitle}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    {primaryLink && (
                      <p className="text-xs text-gray-500">
                        Click to open {primaryLink.label}
                      </p>
                    )}
                  </div>
                </AnimatedCard>
              );
            })}
          </div>

          <div className="text-center">
            <AnimatedButton href="/projects" variant="primary">
              See all projects
            </AnimatedButton>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

