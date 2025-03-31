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
    <div className="rounded-2xl bg-gradient-to-br from-black/90 to-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-sm p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Statistics</h2>
      <h3 className="text-lg font-medium text-slate-400 mb-6">Donations</h3>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <div className="text-lg font-semibold text-white">$25,841.20</div>
          <div className="text-sm text-slate-400 mt-1">Q1</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4">
          <div className="text-lg font-semibold text-white">$19,473.00</div>
          <div className="text-sm text-slate-400 mt-1">Q2</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4">
          <div className="text-lg font-semibold text-white">$16,520.50</div>
          <div className="text-sm text-slate-400 mt-1">Q3</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4">
          <div className="text-lg font-semibold text-white">$41,834.70</div>
          <div className="text-sm text-slate-400 mt-1">Total</div>
        </div>
      </div>

      <div className="relative w-full h-[200px]">
        <div className="absolute inset-0 flex flex-col justify-between">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-slate-800/50 w-full h-0" />
          ))}
        </div>

        <svg className="w-full h-full">
          <path
            d="M0 160 L200 120 L400 140 L600 130"
            fill="none"
            stroke="rgb(168, 85, 247)"
            strokeWidth="2"
          />
          {[
            { x: 0, y: 160 },
            { x: 200, y: 120 },
            { x: 400, y: 140 },
            { x: 600, y: 130 }
          ].map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="rgb(168, 85, 247)"
            />
          ))}
        </svg>

        <div className="absolute bottom-0 w-full flex justify-between text-xs text-slate-400 pt-2">
          <span>31.01.24</span>
          <span>01.11.24</span>
          <span>02.11.24</span>
        </div>
      </div>
    </div>
  );
}