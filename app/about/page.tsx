 "use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { ResumeDownload } from "@/components/resume/ResumeDownload";
import { defaultResumeData } from "@/lib/resume";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface SiteContent {
  key: string;
  content: any;
}

interface SkillCategory {
  _id: string;
  value: string;
  label: string;
  color?: string;
  order: number;
}

export default function AboutPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, string[]>>({});
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [summary, setSummary] = useState({
    title: "About Me",
    subtitle: "Transitioning to AI-First Development",
    summary: "I'm pivoting from traditional software development to embrace AI-first workflows. My focus is on architecture, modern web technologies, and creating engaging interactive experiences that push the boundaries of what's possible.",
  });
  const [story, setStory] = useState({
    paragraph1: "I'm pivoting from traditional software development to embrace AI-first workflows. My focus is on architecture, modern web technologies, and creating engaging interactive experiences that push the boundaries of what's possible.",
    paragraph2: "This portfolio represents my exploration of AI integration patterns, system design, and the future of web development. I'm passionate about building systems that are not just functional, but intelligent, scalable, and delightful to use.",
  });
  const [architecture, setArchitecture] = useState({
    title: "Architecture Focus",
    description: "I'm deeply interested in system architecture and design patterns. My work focuses on creating robust, scalable solutions that can evolve with changing requirements. I believe in building systems that are not just functional today, but adaptable for tomorrow's challenges.",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch skills from new API (grouped by category)
        const skillsResponse = await fetch("/api/skills");
        if (skillsResponse.ok) {
          const skillsData = await skillsResponse.json();
          const grouped = (skillsData.skills || {}) as Record<string, string[]>;
          setSkillsByCategory(grouped);
        }

        // Fetch skill categories for labels / colors
        const categoriesResponse = await fetch("/api/skills/categories");
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setSkillCategories(categoriesData.categories || []);
        }

        // Fetch other content
        const response = await fetch("/api/content");
        if (!response.ok) {
          throw new Error("Failed to fetch site content");
        }
        const data = await response.json();
        const contents: SiteContent[] = data.contents || [];

        // Extract summary
        const summaryContent = contents.find((c) => c.key === "about_summary");
        if (summaryContent?.content) {
          setSummary(summaryContent.content);
        }

        // Extract story
        const storyContent = contents.find((c) => c.key === "about_story");
        if (storyContent?.content) {
          setStory(storyContent.content);
        }

        // Extract architecture
        const archContent = contents.find((c) => c.key === "about_architecture");
        if (archContent?.content) {
          setArchitecture(archContent.content);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        // Use defaults if fetch fails
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const categoriesWithSkills = skillCategories
    .slice()
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
    .filter((cat) => (skillsByCategory[cat.value] || []).length > 0);

  const orphanCategoryEntries = Object.entries(skillsByCategory).filter(
    ([value]) => !skillCategories.find((c) => c.value === value),
  );

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="space-y-16">
        {/* Hero Section */}
        <motion.section 
          className="text-center space-y-6 pb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {summary.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400">
            {summary.subtitle}
          </p>
          {isAdmin && (
            <div className="pt-2">
              <Link
                href="/MonyAdmin/content/about_summary"
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Edit hero summary
                <span aria-hidden>↗</span>
              </Link>
            </div>
          )}
        </motion.section>

        {/* Story Section */}
        <motion.section 
          className="space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Journey
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {story.paragraph1}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {story.paragraph2}
            </p>
          </div>
          {isAdmin && (
            <div className="pt-2">
              <Link
                href="/MonyAdmin/content/about_story"
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Edit story section
                <span aria-hidden>↗</span>
              </Link>
            </div>
          )}
        </motion.section>

        {/* Skills Section */}
        <motion.section 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Skills & Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoriesWithSkills.map((category, index) => {
              const skills = skillsByCategory[category.value] || [];
              const color = category.color || "blue";
              const headingClass = `text-2xl font-bold mb-4 bg-gradient-to-r from-${color}-600 to-${color}-400 bg-clip-text text-transparent`;
              const chipBg = `bg-${color}-100 dark:bg-${color}-900 text-${color}-800 dark:text-${color}-200`;

              return (
                <AnimatedCard key={category._id} delay={0.1 + index * 0.1}>
                  <h3 className={headingClass}>
                    {category.label}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <motion.span
                        key={skill}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${chipBg}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + idx * 0.05 }}
                        whileHover={{ scale: 1.1, y: -2 }}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </AnimatedCard>
              );
            })}

            {/* Fallback for any categories that have skills but no category document */}
            {orphanCategoryEntries.map(([value, skills], index) => (
              <AnimatedCard key={value} delay={0.2 + index * 0.1}>
                <h3 className="text-2xl font-bold mb-4 text-gray-100">
                  {value}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <motion.span
                      key={skill}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + idx * 0.05 }}
                      whileHover={{ scale: 1.1, y: -2 }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </AnimatedCard>
            ))}
          </div>
        </motion.section>

        {/* Resume Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <ResumeDownload resumeData={defaultResumeData} />
        </motion.section>

        {/* Architecture Focus */}
        <motion.section 
          className="space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {architecture.title}
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {architecture.description}
            </p>
          </div>
          {isAdmin && (
            <div className="pt-2">
              <Link
                href="/MonyAdmin/content/about_architecture"
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Edit architecture section
                <span aria-hidden>↗</span>
              </Link>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}

