"use client";

import { motion } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import {
  Mail24Regular,
  Globe24Regular,
  Code24Regular,
  Link24Regular,
  Person24Regular,
} from "@fluentui/react-icons";

interface ContactLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  description: string;
}

export default function ContactPage() {
  const { play: playClick } = useSound("click");
  const { play: playHover } = useSound("hover");

  const contactLinks: ContactLink[] = [
    {
      name: "GitHub",
      url: "https://github.com/Monydragon",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      ),
      color: "text-gray-900 dark:text-white",
      gradient: "from-gray-800 to-gray-900 dark:from-gray-100 dark:to-gray-200",
      description: "View my code repositories and projects",
    },
    {
      name: "Itch.io",
      url: "https://monydragon.itch.io/",
      icon: <Globe24Regular className="w-8 h-8" />,
      color: "text-red-600 dark:text-red-400",
      gradient: "from-red-500 to-red-600",
      description: "Play my games and prototypes",
    },
    {
      name: "X (Twitter)",
      url: "https://twitter.com/Monydragon",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "text-gray-900 dark:text-white",
      gradient: "from-gray-900 to-black dark:from-gray-100 dark:to-gray-300",
      description: "Follow me for updates and thoughts",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/monydragon",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      color: "text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500 to-blue-600",
      description: "Connect with me professionally",
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/Monydragon/",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      ),
      color: "text-blue-600 dark:text-blue-400",
      gradient: "from-blue-600 to-blue-700",
      description: "Stay connected on Facebook",
    },
    {
      name: "Email",
      url: "mailto:monydragon@gmail.com",
      icon: <Mail24Regular className="w-8 h-8" />,
      color: "text-purple-600 dark:text-purple-400",
      gradient: "from-purple-500 to-pink-500",
      description: "Send me an email",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <motion.div
        className="space-y-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.section
          className="text-center space-y-6 pb-4"
          variants={itemVariants}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent pb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Get In Touch
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Let&apos;s connect! Reach out through any of these platforms
          </motion.p>
        </motion.section>

        {/* Contact Links Grid */}
        <motion.section
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {contactLinks.map((link, index) => (
            <motion.a
              key={link.name}
              href={link.url}
              target={link.url.startsWith("mailto:") ? undefined : "_blank"}
              rel={link.url.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10"
              variants={itemVariants}
              onMouseEnter={() => playHover()}
              onClick={() => playClick()}
              whileHover={{ 
                scale: 1.05,
                y: -8,
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Gradient Background on Hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300`}
                initial={false}
              />

              {/* Animated Border Glow */}
              <motion.div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${link.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}
                initial={false}
              />

              {/* Content */}
              <div className="relative z-10 space-y-4">
                {/* Icon */}
                <motion.div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${link.gradient} ${link.color} shadow-lg`}
                  whileHover={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: 1.1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {link.icon}
                </motion.div>

                {/* Name */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    {link.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {link.description}
                  </p>
                </div>

                {/* Arrow Indicator */}
                <motion.div
                  className="flex items-center text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                >
                  <span className="text-sm font-medium mr-2">Visit</span>
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </motion.svg>
                </motion.div>
              </div>

              {/* Shine Effect */}
              <motion.div
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={false}
              />
            </motion.a>
          ))}
        </motion.section>

        {/* Call to Action */}
        <motion.section
          className="text-center space-y-6 pt-8"
          variants={itemVariants}
        >
          <motion.div
            className="inline-block p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 border border-blue-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Let&apos;s Build Something Amazing Together
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Whether you&apos;re interested in collaboration, have a project in mind, or just want to chat about technology and game development, I&apos;d love to hear from you!
            </p>
          </motion.div>
        </motion.section>
      </motion.div>
    </div>
  );
}
