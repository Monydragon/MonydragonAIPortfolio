import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About Me
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Transitioning to AI-First Development
          </p>
        </section>

        {/* Story Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">My Journey</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              I'm pivoting from traditional software development to embrace AI-first workflows.
              My focus is on architecture, modern web technologies, and creating engaging
              interactive experiences that push the boundaries of what's possible.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              This portfolio represents my exploration of AI integration patterns, system design,
              and the future of web development. I'm passionate about building systems that are
              not just functional, but intelligent, scalable, and delightful to use.
            </p>
          </div>
        </section>

        {/* Skills Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Skills & Expertise</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Development</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>TypeScript & JavaScript</li>
                <li>C# & .NET</li>
                <li>Next.js & React</li>
                <li>Node.js</li>
              </ul>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">AI & Architecture</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>AI Integration Patterns</li>
                <li>System Architecture</li>
                <li>Scalable Design</li>
                <li>Modern Workflows</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Resume Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Resume</h2>
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              View my full resume to learn more about my experience and background.
            </p>
            <Link
              href="https://docs.google.com/document/d/1QlelG4Gq3aAMV7g0RUOsBeacYVapZ9Hg/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Resume
            </Link>
          </div>
        </section>

        {/* Architecture Focus */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Architecture Focus</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              I'm deeply interested in system architecture and design patterns. My work focuses
              on creating robust, scalable solutions that can evolve with changing requirements.
              I believe in building systems that are not just functional today, but adaptable
              for tomorrow's challenges.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

