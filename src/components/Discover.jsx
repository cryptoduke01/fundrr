import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, ArrowUpRight } from 'lucide-react';
import { Button } from './ui/button';

export function Discover() {
  const campaigns = [
    {
      id: 1,
      title: 'Save the Ocean Campaign',
      description: 'Help us clean the oceans and protect marine life',
      image: 'https://source.unsplash.com/800x600/?ocean',
      raised: 500,
      goal: 1000,
      supporters: 250,
      daysLeft: 15,
      category: 'Environment',
    },
    {
      id: 2,
      title: 'Tech Education Fund',
      description: 'Providing coding education to underprivileged children',
      image: 'https://source.unsplash.com/800x600/?coding',
      raised: 750,
      goal: 1000,
      supporters: 180,
      daysLeft: 20,
      category: 'Education',
    },
    {
      id: 3,
      title: 'Green Earth Initiative',
      description: 'Plant trees and restore our forests',
      image: 'https://source.unsplash.com/800x600/?forest',
      raised: 300,
      goal: 500,
      supporters: 120,
      daysLeft: 25,
      category: 'Environment',
    },
    {
      id: 4,
      title: 'Community Garden Project',
      description: 'Building sustainable community gardens',
      image: 'https://source.unsplash.com/800x600/?garden',
      raised: 250,
      goal: 400,
      supporters: 90,
      daysLeft: 30,
      category: 'Community',
    },
    {
      id: 5,
      title: 'Animal Shelter Support',
      description: 'Help us provide care for abandoned animals',
      image: 'https://source.unsplash.com/800x600/?animal-shelter',
      raised: 600,
      goal: 800,
      supporters: 300,
      daysLeft: 10,
      category: 'Animals',
    },
    {
      id: 6,
      title: 'Clean Water Project',
      description: 'Providing clean water to rural communities',
      image: 'https://source.unsplash.com/800x600/?water',
      raised: 400,
      goal: 600,
      supporters: 150,
      daysLeft: 18,
      category: 'Healthcare',
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Discover Campaigns</h2>
          <p className="mt-1 text-sm text-slate-400">Support meaningful causes and make an impact</p>
        </div>
        <Button
          variant="outline"
          className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-white border-slate-700 hover:border-slate-600"
        >
          View All
          <ArrowUpRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group rounded-2xl bg-gradient-to-br from-black/90 to-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-sm overflow-hidden"
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-slate-900/90 backdrop-blur-sm text-xs font-medium text-white">
                {campaign.category}
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                {campaign.title}
              </h3>
              <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                {campaign.description}
              </p>

              <div className="mt-4 space-y-3">
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(campaign.raised / campaign.goal) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-white font-medium">
                    {campaign.raised} <span className="text-slate-400">/ {campaign.goal} SOL</span>
                  </div>
                  <div className="text-slate-400">
                    {((campaign.raised / campaign.goal) * 100).toFixed(0)}% funded
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {campaign.supporters} supporters
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {campaign.daysLeft} days left
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white"
                size="sm"
              >
                Support Campaign
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}