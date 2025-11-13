"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSound } from '@/hooks/useSound';
import { ReactNode } from 'react';

interface AnimatedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'nav';
}

export function AnimatedLink({ href, children, className = '', variant = 'default' }: AnimatedLinkProps) {
  const { play: playNavigation } = useSound('navigation');
  const { play: playHover } = useSound('hover');

  const handleClick = () => {
    playNavigation();
  };

  const baseStyles = variant === 'nav' 
    ? "relative text-gray-700 dark:text-gray-300 font-medium"
    : "relative text-blue-600 dark:text-blue-400 font-semibold";

  return (
    <Link href={href} onClick={handleClick}>
      <motion.span
        className={`${baseStyles} ${className} inline-block`}
        onMouseEnter={() => playHover()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Underline animation */}
        <motion.span
          className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"
          whileHover={{ width: '100%' }}
          transition={{ duration: 0.3 }}
        />
        <span className="relative">{children}</span>
      </motion.span>
    </Link>
  );
}

