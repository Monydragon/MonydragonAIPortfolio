"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { ResumeDownload } from "@/components/resume/ResumeDownload";
import { defaultResumeData } from "@/lib/resume";

interface SiteContent {
  key: string;
  content: any;
}

export default function AboutPage() {
  const [skills, setSkills] = useState({
    development: [] as string[],
    ai: [] as string[],
    architecture: [] as string[],
    tools: [] as string[],
  });
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
        
        // Fetch skills from new API
        const skillsResponse = await fetch("/api/skills");
        if (skillsResponse.ok) {
          const skillsData = await skillsResponse.json();
          const grouped = skillsData.skills || {};
          setSkills({
            development: grouped.development || [],
            ai: grouped.ai || [],
            architecture: grouped.architecture || [],
            tools: grouped.tools || [],
          });
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
            <AnimatedCard delay={0.1}>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Development
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.development.map((skill, index) => (
                  <motion.span
                    key={skill}
                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                AI & Architecture
              </h3>
              <div className="flex flex-wrap gap-2">
                {[...skills.ai, ...skills.architecture].map((skill, index) => (
                  <motion.span
                    key={skill}
                    className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.3} className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent">
                Tools & Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.tools.map((tool, index) => (
                  <motion.span
                    key={tool}
                    className="px-4 py-2 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 rounded-full text-sm font-medium"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    {tool}
                  </motion.span>
                ))}
              </div>
            </AnimatedCard>
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
        </motion.section>
      </div>
    </div>
  );
}

