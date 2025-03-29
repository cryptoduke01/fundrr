import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

export function SummaryCards() {
  const cardVariants = {
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

  const progressVariants = {
    hidden: { width: 0 },
    visible: (custom) => ({
      width: `${custom}%`,
      transition: {
        duration: 1,
        ease: "easeInOut"
      }
    })
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
    >
      <div className="grid gap-6">
        <motion.div
          variants={cardVariants}
          className="rounded-2xl bg-gradient-to-br from-black/80 to-slate-900/80 p-6 border border-slate-800 shadow-2xl"
        >
          <div className="mb-2 text-sm text-slate-400">Your Contribution</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl font-bold text-white"
                >
                  $541,840
                </motion.span>
                <span className="text-xl text-slate-400">.00</span>
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex items-center gap-2"
            >
              <div className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-500">+35%</div>
            </motion.div>
          </div>
          <div className="mt-4">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                variants={progressVariants}
                custom={20}
                initial="hidden"
                animate="visible"
                className="h-full bg-purple-600"
              />
              <motion.div
                variants={progressVariants}
                custom={40}
                initial="hidden"
                animate="visible"
                className="h-full bg-green-500"
              />
              <motion.div
                variants={progressVariants}
                custom={40}
                initial="hidden"
                animate="visible"
                className="h-full bg-purple-800"
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              {['0', '100', '200', '300'].map((num, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                >
                  {num}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="rounded-2xl bg-gradient-to-br from-black/80 to-slate-900/80 p-6 border border-slate-800 shadow-2xl"
        >
          <div className="mb-2 text-sm text-slate-400">Your Required Fund</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl font-bold text-white"
                >
                  $285,371
                </motion.span>
                <span className="text-xl text-slate-400">.00</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                variants={progressVariants}
                custom={60}
                initial="hidden"
                animate="visible"
                className="h-full bg-purple-800"
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              {['0', '100', '200', '300'].map((num, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                >
                  {num}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={cardVariants}
        className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-black/80 p-6 flex flex-col shadow-2xl"
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="text-sm text-slate-400">Your Charity Fund</div>
          <div className="flex items-baseline">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-white"
            >
              $120,184
            </motion.span>
            <span className="text-xl text-slate-400">.34</span>
          </div>
        </div>

        <div className="mt-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 ease-in-out">
              Add Funds
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}