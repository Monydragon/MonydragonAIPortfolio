"use client";

import { motion } from 'framer-motion';
import { useSound } from '@/hooks/useSound';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  href?: string;
  hrefTarget?: string;
  hrefRel?: string;
  onClick?: () => void;
  className?: string;
  delay?: number;
}

export function AnimatedCard({ children, href, hrefTarget, hrefRel, onClick, className = '', delay = 0 }: AnimatedCardProps) {
  const { play: playHover } = useSound('hover');
  const { play: playClick } = useSound('click');

  const handleClick = () => {
    playClick();
    onClick?.();
  };

  const cardContent = (
    <motion.div
      className={`relative p-6 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 overflow-hidden group cursor-pointer ${className}`}
      onMouseEnter={() => playHover()}
      onClick={handleClick}
      whileHover={{ 
        scale: 1.02, 
        y: -8,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {/* Gradient border effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5))',
          padding: '1px',
        }}
      >
        <div className="w-full h-full bg-white dark:bg-gray-900 rounded-xl" />
      </motion.div>

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={false}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} target={hrefTarget} rel={hrefRel} className="block">
        {cardContent}
      </a>
    );
  }

  return cardContent;
}

