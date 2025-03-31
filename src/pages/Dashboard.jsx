import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import CustomWalletButton from "../components/CustomWalletButton";
// import Header from '../components/Header';
import SummaryStats from "../components/SummaryStats";
import { SummaryCards } from "../components/SummaryCards";
import { Statistics } from "../components/Statistics";
import Transactions from "../components/Transactions";
import { motion, AnimatePresence } from 'framer-motion';
import { CampaignService } from '../services/campaign';
import { useAnchorProgram } from '../hooks/useAnchorProgram';
import { useNavigate } from 'react-router-dom';
import solanaLogoMark from '../assets/solanaLogoMark.png';
import { Button } from "../components/ui/button";
import { LiveUpdates } from "../components/LiveUpdates";
import { Discover } from "../components/Discover";
import { Spinner } from '@/components/ui/spinner';
import { Shield, Coins, Users, Twitter, Github, Globe, Sparkles, Rocket, Lock, ChevronRight, Play, PauseCircle, Heart, Trophy, Target } from 'lucide-react';

export function Dashboard() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [balance, setBalance] = useState(null);
  const [solPrice, setSolPrice] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const program = useAnchorProgram();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Transparent',
      description: 'Built on Solana blockchain for maximum security and transparency. Every transaction is recorded and verifiable.',
      color: 'from-purple-500 to-blue-500',
      stats: '100% Secure'
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: 'Ultra-Low Fees',
      description: 'Benefit from Solana\'s incredibly low transaction costs. More of your money goes to the causes you care about.',
      color: 'from-green-500 to-emerald-500',
      stats: '< $0.01 fees'
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Experience instant settlements and real-time updates. No more waiting for days to see your impact.',
      color: 'from-orange-500 to-red-500',
      stats: '< 1 sec finality'
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Community Driven',
      description: 'Join a thriving community of changemakers. Together, we\'re making the world a better place.',
      color: 'from-pink-500 to-rose-500',
      stats: '15k+ members'
    }
  ];

  const howItWorks = [
    {
      icon: <Target className="w-6 h-6 text-purple-500" />,
      title: 'Create Campaign',
      description: 'Set up your campaign with a compelling story, funding goal, and timeline.'
    },
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      title: 'Share & Grow',
      description: 'Share your campaign with the community and watch support grow.'
    },
    {
      icon: <Trophy className="w-6 h-6 text-green-500" />,
      title: 'Achieve Goals',
      description: 'Receive funds instantly as supporters contribute to your cause.'
    }
  ];

  const recentCampaigns = [
    {
      title: 'Ocean Cleanup Initiative',
      raised: '45,000',
      goal: '50,000',
      supporters: 234,
      category: 'Environment'
    },
    {
      title: 'Tech Education Fund',
      raised: '28,000',
      goal: '30,000',
      supporters: 156,
      category: 'Education'
    },
    {
      title: 'Community Garden',
      raised: '12,000',
      goal: '15,000',
      supporters: 89,
      category: 'Community'
    }
  ];

  // Fetch SOL price
  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        setSolPrice(data.solana.usd);
        } catch (error) {
        console.error("Error fetching SOL price:", error);
      }
    };
    fetchSolPrice();
    const intervalId = setInterval(fetchSolPrice, 60000); // Update price every minute
    return () => clearInterval(intervalId);
  }, []);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet.publicKey) {
        try {
          const walletBalance = await connection.getBalance(wallet.publicKey);
          setBalance(walletBalance / 1_000_000_000); // Convert lamports to SOL
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };
    
    if (wallet.connected) {
      fetchBalance();
      const intervalId = setInterval(fetchBalance, 30000);
      return () => clearInterval(intervalId);
    }
  }, [connection, wallet.publicKey, wallet.connected]);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleCopyAddress = async () => {
    if (wallet.publicKey) {
      try {
        await navigator.clipboard.writeText(wallet.publicKey.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-[#0A0F1D] relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-slate-900/20" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          {/* Logo and Welcome */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-8"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Fundrr</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              The next generation of decentralized crowdfunding on Solana.
              Fast, secure, and transparent.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl w-full mb-12"
          >
            {[
              { value: '$2.5M+', label: 'Total Raised' },
              { value: '15k+', label: 'Contributors' },
              { value: '500+', label: 'Campaigns' },
              { value: '98%', label: 'Success Rate' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm text-center"
              >
                <div className="text-2xl font-bold text-purple-500">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full mb-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{feature.description}</p>
                <div className="text-sm font-medium text-purple-500">{feature.stats}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Connect Wallet Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center space-y-6"
          >
            <CustomWalletButton />

            <div className="flex items-center justify-center gap-6 mt-8">
              <a href="https://twitter.com/fundrr" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-purple-500/20 hover:text-purple-500 transition-all duration-200 text-slate-400">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://github.com/fundrr" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-purple-500/20 hover:text-purple-500 transition-all duration-200 text-slate-400">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://fundrr.io" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-purple-500/20 hover:text-purple-500 transition-all duration-200 text-slate-400">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const shortAddress = wallet.publicKey ? `${wallet.publicKey.toString().slice(0, 6)}...${wallet.publicKey.toString().slice(-6)}` : '';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Spinner size="xl" className="mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Dashboard</h2>
          <p className="text-slate-400">Fetching your crowdfunding data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-hidden">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-sm sm:text-base text-slate-400">
              Track your fundraising progress and impact
            </p>
          </div>
          <Button
            onClick={() => navigate("/create-campaign")}
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-sm sm:text-base py-2.5 sm:py-3 font-medium"
          >
            Create Campaign
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-slate-400">Balance: {balance?.toFixed(2) || '0.00'} SOL</span>
              </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-slate-400">Contributed: {balance?.toFixed(2) || '0.00'} SOL</span>
              </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-slate-400">Received: {balance?.toFixed(2) || '0.00'} SOL</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
              <SummaryCards />
            </div>

          <div className="lg:col-span-4">
              <Transactions />
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-8">
            <Statistics />
                </div>

          <div className="lg:col-span-4">
            <LiveUpdates />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;