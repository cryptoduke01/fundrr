import React from 'react';
import { motion } from 'framer-motion';

export function Spinner({ size = 'default', className = '' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    default: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-purple-500 border-b-purple-300/30 border-l-purple-300/30"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-t-transparent border-r-transparent border-b-purple-500/50 border-l-purple-500/50"
        animate={{ rotate: -180 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
} 