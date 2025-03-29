import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal } from "lucide-react";

const transactions = [
  {
    id: 1,
    type: "Required Fund",
    amount: "+$420.50",
    name: "Ava Scott",
    date: "Sep 08 2024",
    avatarFallback: "AS",
    color: "bg-purple-600",
  },
  {
    id: 2,
    type: "Contribution",
    amount: "+$790.00",
    name: "Ethan Adams",
    date: "Sep 07 2024",
    avatarFallback: "EA",
    color: "bg-green-500",
  },
  // ... rest of the transactions (keep the same)
];

const Transactions = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom) => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: custom * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 300
      }
    })
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="rounded-2xl bg-gradient-to-br from-black/80 to-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold text-white"
        >
          Transactions
        </motion.h2>
        <motion.button
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <MoreHorizontal className="h-5 w-5" />
        </motion.button>
      </div>

      <div className="divide-y divide-slate-800">
        {transactions.map((transaction, index) => (
          <motion.div 
            key={transaction.id}
            custom={index}
            variants={itemVariants}
            whileHover={{ 
              backgroundColor: 'rgba(30, 35, 48, 0.5)',
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-4 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`
                h-10 w-10 
                rounded-full 
                ${transaction.color} 
                flex items-center 
                justify-center
              `}
            >
              <span className="text-white font-semibold text-sm">
                {transaction.avatarFallback}
              </span>
            </motion.div>

            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between">
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-sm font-medium text-white"
                >
                  {transaction.type}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`text-sm font-medium ${
                    transaction.amount.startsWith("+") 
                      ? "text-green-500" 
                      : "text-red-500"
                  }`}
                >
                  {transaction.amount}
                </motion.span>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-xs text-slate-400"
                >
                  {transaction.name}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-xs text-slate-400"
                >
                  {transaction.date}
                </motion.span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Transactions;