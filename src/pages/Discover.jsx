import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const campaigns = [
    {
      id: 1,
      title: 'Save the Ocean Campaign',
      description: 'Help us clean the oceans and protect marine life from plastic pollution.',
      image: 'https://source.unsplash.com/800x600/?ocean,plastic',
      raised: 500,
      goal: 1000,
      supporters: 250,
      daysLeft: 15,
      category: 'Environment',
    },
    {
      id: 2,
      title: 'Tech Education Fund',
      description: 'Providing coding education to underprivileged children.',
      image: 'https://source.unsplash.com/800x600/?coding,education',
      raised: 750,
      goal: 1000,
      supporters: 180,
      daysLeft: 20,
      category: 'Education',
    },
    {
      id: 3,
      title: 'Green Earth Initiative',
      description: 'Plant trees and restore our forests.',
      image: 'https://source.unsplash.com/800x600/?forest,planting',
      raised: 300,
      goal: 500,
      supporters: 120,
      daysLeft: 25,
      category: 'Environment',
    },
    {
      id: 4,
      title: 'Community Garden Project',
      description: 'Building sustainable community gardens.',
      image: 'https://source.unsplash.com/800x600/?garden,community',
      raised: 250,
      goal: 400,
      supporters: 90,
      daysLeft: 30,
      category: 'Community',
    },
    {
      id: 5,
      title: 'Animal Shelter Support',
      description: 'Help us provide care for abandoned animals.',
      image: 'https://source.unsplash.com/800x600/?animal-shelter,dog',
      raised: 600,
      goal: 800,
      supporters: 300,
      daysLeft: 10,
      category: 'Animals',
    },
    {
      id: 6,
      title: 'Clean Water Project',
      description: 'Providing clean water access to rural communities.',
      image: 'https://source.unsplash.com/800x600/?water,well',
      raised: 400,
      goal: 600,
      supporters: 150,
      daysLeft: 18,
      category: 'Healthcare',
    }
  ];

  const categories = ['All', 'Environment', 'Education', 'Community', 'Animals', 'Healthcare'];

  const filteredCampaigns = campaigns.filter(campaign => {
    if (searchQuery === '' && selectedCategory === 'All') return true;
    
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || campaign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Discover Campaigns
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-400">
            Support meaningful causes and make an impact
          </p>
        </div>
        <Button
          onClick={() => navigate("/create-campaign")}
          className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
        >
          Create Campaign
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              onClick={() => setSelectedCategory(category)}
              className={`flex-none px-4 py-2 rounded-full text-sm border-slate-700 
                ${selectedCategory === category 
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' 
                  : 'text-slate-400 hover:text-white hover:border-slate-600'}`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group rounded-2xl bg-gradient-to-br from-black/90 to-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-sm overflow-hidden"
          >
            <div className="aspect-[16/9] relative overflow-hidden">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute top-4 right-4 px-2.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-sm text-xs font-medium text-white">
                {campaign.category}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                {campaign.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                {campaign.description}
              </p>

              <div className="mt-6 space-y-4">
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
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {campaign.supporters} supporters
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {campaign.daysLeft} days left
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-6 bg-purple-500 hover:bg-purple-600 text-white"
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