"use client";

import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export default function Home() {
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
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          
          <AnimatedCard href="/projects" delay={0.2}>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-2">
                P
              </div>
              <h2 className="text-2xl font-bold">Projects</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Explore my portfolio of work, experiments, and innovative solutions
              </p>
            </div>
          </AnimatedCard>
          
          <AnimatedCard href="/games" delay={0.3}>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white text-2xl font-bold mb-2">
                G
              </div>
              <h2 className="text-2xl font-bold">Games</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Play interactive web games built with Phaser, Unity, and Canvas
              </p>
            </div>
          </AnimatedCard>
        </section>

        {/* Featured Section */}
        <motion.section 
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Featured
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatedCard delay={0.4}>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI-First Architecture
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Exploring modern AI integration patterns, architectural decisions, and building systems that are intelligent, scalable, and future-proof.
                </p>
              </div>
            </AnimatedCard>
            
            <AnimatedCard delay={0.5}>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Interactive Experiences
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Building engaging web games, interactive projects, and delightful user experiences that push the boundaries of what's possible.
                </p>
              </div>
            </AnimatedCard>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

