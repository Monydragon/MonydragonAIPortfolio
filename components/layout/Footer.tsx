"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { 
  Link24Regular,
  Code24Regular,
  Document24Regular,
  Globe24Regular,
  DocumentText24Regular
} from "@fluentui/react-icons";

interface FooterProps {
  version: string;
  lastUpdated: string;
}

export function Footer({ version, lastUpdated }: FooterProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format date on client side to avoid hydration mismatches
  const formattedDate = useMemo(() => {
    if (!mounted) return '';
    return new Date(lastUpdated).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [lastUpdated, mounted]);

  const currentYear = mounted ? new Date().getFullYear() : 2025;

  const externalLinks = [
    {
      name: "Itch.io",
      url: "https://dragonlens.itch.io",
      icon: <Globe24Regular className="w-5 h-5" />,
    },
    {
      name: "Dragon Lens",
      url: "https://dragonlens.io",
      icon: <Link24Regular className="w-5 h-5" />,
    },
    {
      name: "GitHub",
      url: "https://github.com/monydragon",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Site Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mony Dragon
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              AI-First Developer Portfolio
            </p>
            {/* External Links */}
            <div className="flex gap-4">
              {externalLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2">
                  <DocumentText24Regular className="w-4 h-4" />
                  About
                </Link>
              </li>
              <li>
                <Link href="/experience" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2">
                  <Document24Regular className="w-4 h-4" />
                  Experience
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2">
                  <Code24Regular className="w-4 h-4" />
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2">
                  <DocumentText24Regular className="w-4 h-4" />
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2">
                  <Link24Regular className="w-4 h-4" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Version Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Site Info</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>
                <span className="font-medium">Version:</span> {version}
              </p>
              <p>
                <span className="font-medium">Last Updated:</span> {formattedDate || 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; {currentYear} Mony Dragon. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
