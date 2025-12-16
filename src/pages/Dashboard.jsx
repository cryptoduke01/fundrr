import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Plus, TrendingUp, Wallet, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchAllCampaigns } from '../utils/programHelpers';
import { useProgram } from '../contexts/ProgramContext';

export function Dashboard() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const navigate = useNavigate();
  const program = useProgram();
  const [balance, setBalance] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wallet balance
  useEffect(() => {
    if (!wallet.connected || !wallet.publicKey) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const walletBalance = await connection.getBalance(wallet.publicKey);
        setBalance(walletBalance / 1_000_000_000);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(null);
      }
    };
    
    fetchBalance();
    const intervalId = setInterval(fetchBalance, 30000);
    return () => clearInterval(intervalId);
  }, [connection, wallet.publicKey?.toString(), wallet.connected]);

  // Fetch campaigns
  useEffect(() => {
    const loadCampaigns = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!program) {
          setError('Program not initialized. Please ensure your wallet is connected and the program is deployed.');
          setIsLoading(false);
          return;
        }

        if (!wallet.publicKey) {
          setError('Wallet not connected');
          setIsLoading(false);
          return;
        }

        const campaignData = await fetchAllCampaigns(program, wallet.publicKey);
        setCampaigns(campaignData);
      } catch (error) {
        console.error('Error loading campaigns:', error);
        setError(error.message || 'Failed to load campaigns. Make sure the program is deployed to devnet.');
      } finally {
        setIsLoading(false);
      }
    };

    if (program && wallet.publicKey) {
      loadCampaigns();
    } else if (!wallet.connected) {
      setIsLoading(false);
    }
  }, [program, wallet.publicKey, wallet.connected]);

  const retryLoad = () => {
    if (program && wallet.publicKey) {
      const loadCampaigns = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const campaignData = await fetchAllCampaigns(program, wallet.publicKey);
          setCampaigns(campaignData);
        } catch (error) {
          console.error('Error loading campaigns:', error);
          setError(error.message || 'Failed to load campaigns. Make sure the program is deployed to devnet.');
        } finally {
          setIsLoading(false);
        }
      };
      loadCampaigns();
    }
  };

  const totalRaised = campaigns.reduce((sum, c) => sum + c.amountRaised, 0);
  const activeCampaigns = campaigns.filter(c => c.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#000000] dark:via-[#0a0e27] dark:to-[#000000] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h1 className="text-5xl font-bold mb-3 text-black dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-white/60 text-lg">
              Overview of your fundraising activity
            </p>
          </div>
          <Button
            onClick={() => navigate("/create-campaign")}
            className="glass-button bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 h-14 px-8 rounded-xl font-semibold text-lg shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div
            className="glass-card rounded-2xl p-8 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600 dark:text-white/60 uppercase tracking-wide">Wallet Balance</p>
              <div className="p-3 rounded-xl bg-black/10 dark:bg-white/10">
                <Wallet className="w-6 h-6 text-black dark:text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold text-black dark:text-white">
              {balance?.toFixed(2) || '0.00'} SOL
            </p>
          </div>

          <div
            className="glass-card rounded-2xl p-8 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600 dark:text-white/60 uppercase tracking-wide">Total Raised</p>
              <div className="p-3 rounded-xl bg-black/10 dark:bg-white/10">
                <TrendingUp className="w-6 h-6 text-black dark:text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold text-black dark:text-white">
              {totalRaised.toFixed(2)} SOL
            </p>
          </div>

          <div
            className="glass-card rounded-2xl p-8 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600 dark:text-white/60 uppercase tracking-wide">Active Campaigns</p>
              <div className="p-3 rounded-xl bg-black/10 dark:bg-white/10">
                <Clock className="w-6 h-6 text-black dark:text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold text-black dark:text-white">
              {activeCampaigns}
            </p>
          </div>
        </div>

        {/* Campaigns List */}
        <div
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="p-8 border-b border-black/10 dark:border-white/10">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Your Campaigns
            </h2>
          </div>
          
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="inline-block w-12 h-12 border-3 border-black dark:border-white border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-white/60">Loading campaigns...</p>
            </div>
          ) : error ? (
            <div className="p-16 text-center">
              <AlertCircle className="w-16 h-16 text-black dark:text-white mx-auto mb-6 opacity-50" />
              <p className="text-black dark:text-white mb-4 font-semibold text-lg">{error}</p>
              <p className="text-gray-600 dark:text-white/60 mb-6 text-sm">Make sure the program is deployed: <code className="font-mono bg-black/5 dark:bg-white/5 px-2 py-1 rounded">2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu</code></p>
              <Button
                onClick={retryLoad}
                variant="outline"
                className="rounded-xl border-2 border-black dark:border-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-black/10 dark:bg-white/10 flex items-center justify-center">
                <Plus className="w-10 h-10 text-black dark:text-white" />
              </div>
              <p className="text-gray-600 dark:text-white/60 mb-6 text-lg">No campaigns yet</p>
              <Button
                onClick={() => navigate("/create-campaign")}
                className="bg-black dark:bg-white text-white dark:text-black rounded-xl px-8"
              >
                Create your first campaign
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {campaigns.map((campaign, index) => {
                const progress = (campaign.amountRaised / campaign.goalAmount) * 100;
                const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

                return (
                  <div
                    key={campaign.publicKey.toString()}
                    onClick={() => navigate(`/campaign/${campaign.publicKey.toString()}`)}
                    className="p-8 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-black dark:text-white mb-2 group-hover:text-black/80 dark:group-hover:text-white/80 transition-colors">
                          {campaign.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-white/60 line-clamp-2">
                          {campaign.description}
                        </p>
                      </div>
                      <span className={`ml-4 px-4 py-2 rounded-full text-xs font-semibold ${
                        campaign.isActive
                          ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border border-black/20 dark:border-white/20'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
                      }`}>
                        {campaign.isActive ? 'Active' : 'Ended'}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-white/60 font-medium">
                          {campaign.amountRaised.toFixed(2)} / {campaign.goalAmount.toFixed(2)} SOL
                        </span>
                        <span className="text-black dark:text-white font-bold">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, progress)}%` }}
                          className="h-full bg-black dark:bg-white rounded-full transition-all duration-300"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-white/40">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {daysLeft} days left
                        </span>
                        <span className="font-mono">By {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
