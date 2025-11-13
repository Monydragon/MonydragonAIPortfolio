"use client";

import { motion } from 'framer-motion';
import { useSound } from '@/hooks/useSound';
import { useState } from 'react';
import { generateResumeText, ResumeData } from '@/lib/resume';

interface ResumeDownloadProps {
  resumeData: ResumeData;
}

export function ResumeDownload({ resumeData }: ResumeDownloadProps) {
  const { play: playClick } = useSound('click');
  const { play: playSuccess } = useSound('success');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    playClick();
    setIsGenerating(true);

    try {
      // Generate resume text
      const resumeText = generateResumeText(resumeData);
      
      // Create blob and download
      const blob = new Blob([resumeText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MonyDragon_Resume_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      playSuccess();
    } catch (error) {
      console.error('Error generating resume:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Living Resume
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            My resume automatically updates based on projects and experience added to this site.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last updated: {typeof window !== 'undefined' ? new Date(resumeData.lastUpdated).toLocaleDateString() : resumeData.lastUpdated.split('T')[0]}
          </p>
        </div>
        
        <motion.button
          onClick={handleDownload}
          disabled={isGenerating}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={false}
          />
          <span className="relative z-10 flex items-center gap-2">
            {isGenerating ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Resume
              </>
            )}
          </span>
        </motion.button>
      </div>
      
      {/* View online link */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <a
          href="https://docs.google.com/document/d/1QlelG4Gq3aAMV7g0RUOsBeacYVapZ9Hg/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-2"
        >
          <span>View on Google Docs</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}

