export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="space-y-12">
        {/* Header */}
        <section className="text-center space-y-4 pb-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Contact
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Get in touch with me
          </p>
        </section>

        {/* Contact Info */}
        <section className="space-y-6">
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Email</h2>
            <a
              href="mailto:monydragon@hotmail.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              monydragon@hotmail.com
            </a>
          </div>

          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Website</h2>
            <a
              href="https://monydragon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              monydragon.com
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

