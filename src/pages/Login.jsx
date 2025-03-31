import React from 'react';
import { motion } from 'framer-motion';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Github, Twitter, Discord, Globe, ArrowRight, Shield, Coins, Users } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export function Login() {
  const features = [
    {
      icon: <Shield className="w-6 h-6 text-purple-500" />,
      title: 'Secure Crowdfunding',
      description: 'Built on Solana blockchain, ensuring transparent and secure transactions for all campaigns.'
    },
    {
      icon: <Coins className="w-6 h-6 text-purple-500" />,
      title: 'Low Transaction Fees',
      description: 'Benefit from Solana\'s ultra-low transaction fees, maximizing your contribution impact.'
    },
    {
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: 'Community Driven',
      description: 'Join a thriving community of creators and supporters making real-world impact.'
    }
  ];

  const stats = [
    { value: '500k+', label: 'Total Raised' },
    { value: '10k+', label: 'Contributors' },
    { value: '1000+', label: 'Campaigns' },
    { value: '95%', label: 'Success Rate' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">FloFi</span>
              </h1>
              <p className="text-xl text-slate-300">
                The next generation of decentralized crowdfunding on Solana
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-purple-500">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <WalletMultiButton className="!bg-purple-500 hover:!bg-purple-600 !rounded-xl !px-6 !py-3 !text-white !font-medium transition-all duration-200" />
                <motion.div
                  animate={{
                    x: [0, 10, 0],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="w-6 h-6 text-purple-500" />
                </motion.div>
              </div>

              <div className="flex items-center gap-4">
                <a href="https://twitter.com/flofi" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                  <Twitter className="w-5 h-5 text-slate-400 hover:text-purple-500" />
                </a>
                <a href="https://discord.gg/flofi" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                  <Discord className="w-5 h-5 text-slate-400 hover:text-purple-500" />
                </a>
                <a href="https://github.com/flofi" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                  <Github className="w-5 h-5 text-slate-400 hover:text-purple-500" />
                </a>
                <a href="https://flofi.io" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                  <Globe className="w-5 h-5 text-slate-400 hover:text-purple-500" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            <div className="grid gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="p-6 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-slate-700/50">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-4">
                <Spinner size="sm" />
                <p className="text-purple-400">
                  Connect your wallet to start exploring campaigns
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 