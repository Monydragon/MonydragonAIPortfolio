"use client";

import { motion } from 'framer-motion';
import { useSound } from '@/hooks/useSound';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  href?: string;
  hrefTarget?: string;
  hrefRel?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
}

export function AnimatedButton({ 
  children, 
  href, 
  hrefTarget,
  hrefRel,
  onClick, 
  variant = 'primary',
  className = '',
  disabled = false
}: AnimatedButtonProps) {
  const { play: playClick } = useSound('click');
  const { play: playHover } = useSound('hover');

  const baseStyles = "relative inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 overflow-hidden group";
  
  const variantStyles = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700",
    ghost: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
  };

  const sharedClassNames = `${baseStyles} ${variantStyles[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`;

  const handleClick = () => {
    if (!disabled) {
      playClick();
      onClick?.();
    }
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      playHover();
    }
  };

  const innerContent = (
    <>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={false}
      />
      <motion.div
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={false}
      />
      <span className="relative z-10 flex items-center gap-2 justify-center">{children}</span>
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        target={hrefTarget}
        rel={hrefRel}
        className={sharedClassNames}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {innerContent}
      </motion.a>
    );
  }

  return (
    <motion.button
      className={sharedClassNames}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {innerContent}
    </motion.button>
  );
}

