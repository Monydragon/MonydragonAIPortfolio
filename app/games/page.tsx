export default function GamesPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="space-y-12">
        {/* Header */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Games
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Interactive web games built with Phaser, Unity, and Canvas
          </p>
        </section>

        {/* Games Grid */}
        <section>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Games coming soon...</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              The games section will feature Phaser, Unity WebGL, and Canvas-based games
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

