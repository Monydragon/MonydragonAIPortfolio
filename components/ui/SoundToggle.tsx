"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { soundManager } from "@/lib/sounds";
import { useSound } from "@/hooks/useSound";

export function SoundToggle() {
  // Start with false to avoid hydration mismatch, then update on client
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { play: playSuccess } = useSound("success", true);

  useEffect(() => {
    // Only check localStorage on client side
    setMounted(true);
    soundManager.loadPreferences();
    setEnabled(soundManager.isEnabled());
  }, []);

  const toggle = () => {
    const next = !enabled;
    soundManager.setEnabled(next);
    setEnabled(next);
    if (next) {
      playSuccess();
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="relative flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm">
        <div className="h-5 w-5" />
      </div>
    );
  }

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`relative flex items-center justify-center rounded-full border px-3 py-2 text-sm transition-colors duration-300 ${
        enabled
          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-300"
          : "border-gray-200 bg-white text-gray-500 hover:text-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
      }`}
      aria-label={enabled ? "Disable interface sounds" : "Enable interface sounds"}
      title={enabled ? "Disable interface sounds" : "Enable interface sounds"}
    >
      {enabled ? <SoundOnIcon /> : <SoundOffIcon />}
    </motion.button>
  );
}

function SoundOnIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5L6 9H3v6h3l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 010 7.07" />
      <path d="M19.07 4.93a10 10 0 010 14.14" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5L6 9H3v6h3l5 4V5z" />
      <line x1="21" y1="4" x2="15" y2="10" />
      <line x1="15" y1="14" x2="21" y2="20" />
    </svg>
  );
}
