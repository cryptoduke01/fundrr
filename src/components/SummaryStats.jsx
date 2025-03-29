import React from 'react';
import { motion } from 'framer-motion';
import { Circle } from "lucide-react";

const SummaryStats = () => {
  const statsData = [
    { color: 'blue', label: 'CF', amount: '$20,184.34' },
    { color: 'green', label: 'Contribution', amount: '$541,840.00' },
    { color: 'purple', label: 'Required Fund', amount: '$285,371.00' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300 
      }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex items-center justify-center gap-6 mb-8"
    >
      {statsData.map((stat, index) => (
        <motion.div 
          key={index}
          variants={itemVariants}
          className="flex items-center gap-2 hover:scale-105 transition-transform duration-300"
        >
          <Circle 
            className={`h-3 w-3 fill-${stat.color}-500 text-${stat.color}-500`} 
          />
          <span className="text-sm text-white">
            {stat.label}: {stat.amount}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SummaryStats;