import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-4xl w-full space-y-8 text-center">
        {/* Hero Section */}
        <section className="space-y-4 py-20">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mony Dragon
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
            AI-First Developer & Architect
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Transitioning from traditional software development to AI-first workflows.
            Exploring architecture, building interactive experiences, and pushing the boundaries of modern web development.
          </p>
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10">
          <Link 
            href="/about" 
            className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">About</h2>
            <p className="text-gray-600 dark:text-gray-400">Learn about my journey and expertise</p>
          </Link>
          
          <Link 
            href="/projects" 
            className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Projects</h2>
            <p className="text-gray-600 dark:text-gray-400">Explore my portfolio of work</p>
          </Link>
          
          <Link 
            href="/games" 
            className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Games</h2>
            <p className="text-gray-600 dark:text-gray-400">Play interactive web games</p>
          </Link>
        </section>

        {/* Featured Section */}
        <section className="py-10">
          <h2 className="text-3xl font-bold mb-6">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">AI-First Architecture</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Exploring modern AI integration patterns and architectural decisions
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Interactive Experiences</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Building engaging web games and interactive projects
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

