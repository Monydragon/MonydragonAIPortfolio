"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/AnimatedCard";

interface Experience {
  _id?: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string[];
  technologies?: string[];
}

export default function ExperiencePage() {
  const [experience, setExperience] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExperience() {
      try {
        setLoading(true);
        const response = await fetch("/api/experience");
        if (!response.ok) {
          throw new Error("Failed to fetch experience");
        }
        const data = await response.json();
        setExperience(data.experiences || []);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching experience:", err);
        setError(err.message || "Failed to load experience");
      } finally {
        setLoading(false);
      }
    }

    fetchExperience();
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="space-y-16">
        {/* Header */}
        <motion.section 
          className="text-center space-y-6 pb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Work Experience
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400">
            My professional journey and career milestones
          </p>
        </motion.section>

        {/* Experience Timeline */}
        <section className="relative">
          {loading ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading experience...</p>
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
          ) : experience.length > 0 ? (
            <>
              {/* Timeline line - hidden on mobile, visible on desktop */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600 transform -translate-x-1/2" />
              
              {/* Mobile timeline line */}
              <div className="md:hidden absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600" />

              <div className="space-y-12">
                {experience.map((exp, index) => (
              <motion.div
                key={exp._id || index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                {/* Timeline dot */}
                <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full border-4 border-white dark:border-gray-950 transform md:-translate-x-1/2 z-10" />

                {/* Experience Card */}
                <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}>
                  <AnimatedCard delay={index * 0.1}>
                    <div className="space-y-4">
                      {/* Header */}
                      <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {exp.title}
                        </h3>
                        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-1">
                          {exp.company}
                        </p>
                        {exp.location && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            📍 {exp.location}
                          </p>
                        )}
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate || 'Present'}
                        </span>
                        {exp.current && (
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                            Current
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        {exp.description.map((desc, descIndex) => (
                          <motion.p
                            key={descIndex}
                            className="text-gray-600 dark:text-gray-400 leading-relaxed flex items-start gap-2"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 + descIndex * 0.1 }}
                          >
                            <span className="text-blue-600 dark:text-blue-400 mt-1.5">▸</span>
                            <span>{desc}</span>
                          </motion.p>
                        ))}
                      </div>

                      {/* Technologies */}
                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Technologies:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {exp.technologies.map((tech, techIndex) => (
                              <motion.span
                                key={techIndex}
                                className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.2 + techIndex * 0.05 }}
                                whileHover={{ scale: 1.1, y: -2 }}
                              >
                                {tech}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AnimatedCard>
                  </div>
                </motion.div>
              ))}
              </div>
            </>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Experience details coming soon...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Work experience will be displayed here
              </p>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}

