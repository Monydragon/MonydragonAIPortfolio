"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
      router.push("/MonyAdmin/login");
  };

  const adminSections = [
    {
      title: "Blog Posts",
      description: "Create, edit, and manage blog posts",
      href: "/MonyAdmin/blog",
      icon: "📝",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Projects",
      description: "Manage portfolio projects",
      href: "/MonyAdmin/projects",
      icon: "💼",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Experience",
      description: "Update work experience entries",
      href: "/MonyAdmin/experience",
      icon: "💼",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Site Content",
      description: "Edit about section and site content",
      href: "/MonyAdmin/content",
      icon: "⚙️",
      color: "from-pink-500 to-pink-600",
    },
    {
      title: "LLM Configuration",
      description: "Configure AI providers and prompts",
      href: "/MonyAdmin/llm",
      icon: "🤖",
      color: "from-amber-500 to-amber-600",
    },
    {
      title: "Backup & Export",
      description: "Download complete site data backup",
      href: "/api/backup",
      icon: "💾",
      color: "from-indigo-500 to-indigo-600",
      isDownload: true,
    },
  ];

  const handleBackup = () => {
    window.location.href = "/api/backup";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {session?.user?.name}
              </p>
            </div>
            <AnimatedButton onClick={handleSignOut} variant="secondary">
              Sign Out
            </AnimatedButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="space-y-8">
          {/* Overview Cards */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminSections.map((section, index) => {
                const cardContent = (
                  <AnimatedCard delay={index * 0.1}>
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-3xl`}>
                        {section.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </AnimatedCard>
                );

                if (section.isDownload) {
                  return (
                    <div key={section.href} onClick={handleBackup} className="cursor-pointer">
                      {cardContent}
                    </div>
                  );
                }

                return (
                  <Link key={section.href} href={section.href}>
                    {cardContent}
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Stats Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatedCard delay={0.1}>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    -
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Total Blog Posts</p>
                </div>
              </AnimatedCard>
              <AnimatedCard delay={0.2}>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    -
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Total Projects</p>
                </div>
              </AnimatedCard>
              <AnimatedCard delay={0.3}>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    -
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Total Views</p>
                </div>
              </AnimatedCard>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

