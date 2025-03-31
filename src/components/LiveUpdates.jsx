import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Heart, ArrowUpRight, Users } from 'lucide-react';

const initialUpdates = [
  {
    type: 'new_campaign',
    title: 'Save the Ocean Campaign',
    creator: 'Ocean Foundation',
    time: '2 mins ago',
    icon: <Trophy className="w-4 h-4 text-purple-500" />,
    amount: '500 SOL',
  },
  {
    type: 'contribution',
    title: 'Tech Education Fund',
    contributor: 'Anonymous',
    time: '5 mins ago',
    icon: <Heart className="w-4 h-4 text-pink-500" />,
    amount: '2.5 SOL',
  },
  {
    type: 'milestone',
    title: 'Green Earth Initiative',
    achievement: '75% of goal reached',
    time: '12 mins ago',
    icon: <ArrowUpRight className="w-4 h-4 text-green-500" />,
    amount: '750 SOL',
  },
  {
    type: 'new_supporters',
    title: 'Community Garden Project',
    count: '50 new supporters',
    time: '15 mins ago',
    icon: <Users className="w-4 h-4 text-blue-500" />,
    amount: '100 SOL',
  }
];

export function LiveUpdates() {
  const [updates, setUpdates] = useState(initialUpdates);

  useEffect(() => {
    const interval = setInterval(() => {
      // Shuffle the updates array
      setUpdates(currentUpdates => {
        const newUpdates = [...currentUpdates];
        for (let i = newUpdates.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newUpdates[i], newUpdates[j]] = [newUpdates[j], newUpdates[i]];
        }
        // Update the times
        return newUpdates.map(update => ({
          ...update,
          time: Math.floor(Math.random() * 30) + 1 + ' mins ago'
        }));
      });
    }, 3000); // Shuffle every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-black/90 to-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-sm p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Live Updates</h2>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {updates.map((update, index) => (
            <motion.div
              key={update.title + index}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 transition-colors cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-slate-700/50">
                {update.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white truncate">
                    {update.title}
                  </p>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {update.time}
                  </span>
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  {update.type === 'new_campaign' && (
                    <p>New campaign by {update.creator}</p>
                  )}
                  {update.type === 'contribution' && (
                    <p>{update.contributor} contributed {update.amount}</p>
                  )}
                  {update.type === 'milestone' && (
                    <p>{update.achievement}</p>
                  )}
                  {update.type === 'new_supporters' && (
                    <p>{update.count} joined</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
} 