"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { LiveEditableField } from "@/components/ui/LiveEditableField";
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

  const [homeContent, setHomeContent] = useState({
    title: "Mony Dragon",
    subtitle: "AI-First Developer & Architect",
    description: "Transitioning from traditional software development to AI-first workflows. Exploring architecture, building interactive experiences, and pushing the boundaries of modern web development.",
    featuredProjectsTitle: "Featured Projects",
    featuredProjectsDescription: "Spotlighting active releases and flagship systems available on Itch.io, the Unity Asset Store, and beyond.",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch("/api/content?key=home_hero");
        if (response.ok) {
          const data = await response.json();
          const heroContent = data.contents?.find((c: any) => c.key === "home_hero");
          if (heroContent?.content) {
            setHomeContent((prev) => ({ ...prev, ...heroContent.content }));
          }
        }
      } catch (error) {
        console.error("Error fetching home content:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

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
            <LiveEditableField
              contentKey="home_hero"
              field="title"
              defaultValue={homeContent.title}
              as="span"
              onUpdate={(value) => setHomeContent((prev) => ({ ...prev, title: value }))}
            />
          </motion.h1>

          <motion.p
            className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <LiveEditableField
              contentKey="home_hero"
              field="subtitle"
              defaultValue={homeContent.subtitle}
              as="span"
              onUpdate={(value) => setHomeContent((prev) => ({ ...prev, subtitle: value }))}
            />
          </motion.p>

          <motion.p
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <LiveEditableField
              contentKey="home_hero"
              field="description"
              defaultValue={homeContent.description}
              as="span"
              onUpdate={(value) => setHomeContent((prev) => ({ ...prev, description: value }))}
            />
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <AnimatedButton href="/sites/app-builder" variant="primary" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              🚀 Build Your App - Start Free!
            </AnimatedButton>
            <AnimatedButton href="/about" variant="secondary">
              Learn More
            </AnimatedButton>
            <AnimatedButton href="/projects" variant="secondary">
              View Projects
            </AnimatedButton>
            <AnimatedButton href="/about#resume" variant="secondary">
              View Resume
            </AnimatedButton>
          </motion.div>
          
          {/* Quick Resume Link */}
          <motion.div
            className="text-center pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Link
              href="/about"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              Quick Resume Information →
            </Link>
          </motion.div>
        </motion.section>

        {/* App Builder CTA Section */}
        <motion.section
          className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Build Apps with AI - Start for Free!
              </h2>
              <p className="text-xl text-blue-100 mb-6">
                Get started with free credits. No credit card required. Earn more by playing games!
              </p>
              <Link
                href="/sites/app-builder"
                className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                Start Building Now →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              {/* Free Tier */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold mb-2">FREE</div>
                  <div className="text-5xl font-bold mb-1">$0</div>
                  <div className="text-sm text-blue-100">per month</div>
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    <span>100 free credits to start</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    <span>50 credits/month (non-commercial)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    <span>Earn credits by playing games</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    <span>Basic AI models</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    <span>Community support</span>
                  </li>
                </ul>
                <Link
                  href="/sites/app-builder"
                  className="block w-full text-center py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Starter Tier */}
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 border-2 border-yellow-300 shadow-lg">
                <div className="text-center mb-4">
                  <div className="text-xs font-bold text-yellow-300 mb-2 uppercase tracking-wide">Popular</div>
                  <div className="text-3xl font-bold mb-2">Starter</div>
                  <div className="text-5xl font-bold mb-1">$20</div>
                  <div className="text-sm text-blue-100">per month</div>
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    <span>200 credits/month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    <span>Commercial use allowed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    <span>All AI models</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    <span>Email support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    <span>Earn more by playing games</span>
                  </li>
                </ul>
                <Link
                  href="/sites/app-builder"
                  className="block w-full text-center py-3 bg-yellow-300 text-blue-900 hover:bg-yellow-200 rounded-lg font-semibold transition-colors"
                >
                  Start Starter Plan
                </Link>
              </div>

              {/* Professional Tier */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold mb-2">Pro</div>
                  <div className="text-5xl font-bold mb-1">$100</div>
                  <div className="text-sm text-blue-100">per month</div>
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    <span>2,500 credits/month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    <span><strong>Priority support</strong> (faster response)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    <span>Advanced AI models</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    <span>Code review included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    <span>Earn more by playing games</span>
                  </li>
                </ul>
                <Link
                  href="/sites/app-builder"
                  className="block w-full text-center py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors"
                >
                  Start Pro Plan
                </Link>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-blue-100 text-sm">
                💡 <strong>Earn Credits for Free:</strong> Play games from trusted developers to earn additional credits without spending money!
              </p>
            </div>
          </div>
        </motion.section>

        {/* Quick Links */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnimatedCard href="/about" delay={0.1}>
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold">
                About
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Learn about my journey, expertise, and transition to AI-first development
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard href="/experience" delay={0.15}>
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-sm font-bold">
                Experience
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Explore my work history across games, enterprise engineering, and leadership roles
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard href="/projects" delay={0.2}>
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm font-bold">
                Projects
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Browse systems, plugins, and games built for Unity, RPG Maker, and the web
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard href="/blog" delay={0.25}>
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white text-sm font-bold">
                Blog
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Read about architecture insights, AI-first workflows, and development updates
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
              <LiveEditableField
                contentKey="home_hero"
                field="featuredProjectsTitle"
                defaultValue={homeContent.featuredProjectsTitle}
                as="span"
                onUpdate={(value) => setHomeContent((prev) => ({ ...prev, featuredProjectsTitle: value }))}
              />
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              <LiveEditableField
                contentKey="home_hero"
                field="featuredProjectsDescription"
                defaultValue={homeContent.featuredProjectsDescription}
                as="span"
                onUpdate={(value) => setHomeContent((prev) => ({ ...prev, featuredProjectsDescription: value }))}
              />
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

