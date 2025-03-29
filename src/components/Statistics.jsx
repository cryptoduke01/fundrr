import React from 'react';
import { motion } from 'framer-motion';
import { Circle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function Statistics() {
  const statsData = [
    { color: "blue", amount: "$25,841.20", change: "$417" },
    { color: "green", amount: "$19,473.00", change: "$534" },
    { color: "purple", amount: "$16,520.50", change: "$657" },
    { color: "cyan", amount: "$41,834.70", change: "Total" }
  ];

  const chartData = [
    { month: "05.01.24", value: 20184 },
    { month: "31.01.24", value: 24185 },
    { month: "01.11.24", value: 22500 },
    { month: "02.11.24", value: 25000 }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
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
      className="rounded-2xl bg-gradient-to-br from-black/80 to-slate-900/80 p-6 border border-slate-800 mb-8 shadow-2xl"
    >
      <div className="mb-6">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold text-white"
        >
          Statistics
        </motion.h2>
        <motion.h3
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl font-semibold text-white"
        >
          Donations
        </motion.h3>
      </div>

      <div className="grid gap-4">
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-4 gap-4"
        >
          {statsData.map(({ color, amount, change }, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="rounded-md bg-slate-800 p-3 flex items-center gap-2 hover:bg-slate-700 transition-colors duration-300"
            >
              <Circle className={`h-4 w-4 fill-${color}-500 text-${color}-500`} />
              <span className="text-sm font-medium text-white">{amount}</span>
              <span className="text-xs text-slate-400 ml-auto">{change}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="relative h-48 w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'white', fontSize: 10 }}
              />
              <YAxis 
                hide={true}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(0,0,0,0.8)', 
                  border: 'none',
                  color: 'white'
                }}
                labelStyle={{ color: 'white' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#8884d8', stroke: 'white' }}
                activeDot={{ r: 6, fill: '#8884d8', stroke: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute right-12 top-12 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white"
          >
            $24,185.50
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}