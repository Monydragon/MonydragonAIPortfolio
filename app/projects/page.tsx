"use client";

import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/AnimatedCard";

export default function ProjectsPage() {
  // Placeholder projects - will be replaced with database data
  const projects = [
    {
      id: 1,
      title: "Portfolio Website",
      description: "This responsive portfolio site built with Next.js 15 and TypeScript, featuring animations, sound effects, and a living resume system.",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
      status: "In Progress"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="space-y-12">
        {/* Header */}
        <motion.section 
          className="text-center space-y-4 pb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Projects
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400">
            A showcase of my work and experiments
          </p>
        </motion.section>

        {/* Projects Grid */}
        <section>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <AnimatedCard key={project.id} delay={index * 0.1}>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">{project.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, techIndex) => (
                        <motion.span
                          key={techIndex}
                          className="px-3 py-1 text-sm bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 rounded-full font-medium"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + techIndex * 0.05 }}
                          whileHover={{ scale: 1.1, y: -2 }}
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-500 font-medium">{project.status}</span>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-gray-600 dark:text-gray-400 text-lg">Projects coming soon...</p>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}

