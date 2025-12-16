import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import { useProgram } from '../contexts/ProgramContext';
import { fetchUserCampaigns, withdrawFunds } from '../utils/programHelpers';
import { Button } from '../components/ui/button';
import { Plus, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const MyCampaigns = () => {
  const { publicKey, connected } = useWallet();
  const navigate = useNavigate();
  const program = useProgram();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawingCampaignId, setWithdrawingCampaignId] = useState(null);

  useEffect(() => {
    if (!connected) {
      navigate('/');
      return;
    }

    const loadMyCampaigns = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!program) {
          setError('Program not initialized. Please ensure your wallet is connected and the program is deployed.');
          setIsLoading(false);
          return;
        }

        if (!publicKey) {
          setError('Wallet not connected');
          setIsLoading(false);
          return;
        }

        const campaignData = await fetchUserCampaigns(program, publicKey);
        setCampaigns(campaignData);
      } catch (error) {
        console.error('Error loading campaigns:', error);
        setError(error.message || 'Failed to load your campaigns. Make sure the program is deployed to devnet.');
      } finally {
        setIsLoading(false);
      }
    };

    if (program && publicKey) {
      loadMyCampaigns();
    }
  }, [program, publicKey, connected, navigate]);

  const retryLoad = () => {
    if (program && publicKey) {
      const loadMyCampaigns = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const campaignData = await fetchUserCampaigns(program, publicKey);
          setCampaigns(campaignData);
        } catch (error) {
          console.error('Error loading campaigns:', error);
          setError(error.message || 'Failed to load your campaigns. Make sure the program is deployed to devnet.');
        } finally {
          setIsLoading(false);
        }
      };
      loadMyCampaigns();
    }
  };

  const handleWithdraw = async (campaignId) => {
    if (isWithdrawing) return;

    setIsWithdrawing(true);
    setWithdrawingCampaignId(campaignId);
    try {
      const loadingToast = toast.loading('Processing withdrawal...');

      const result = await withdrawFunds(program, { publicKey }, campaignId);

      if (result.success) {
        toast.success('Funds withdrawn successfully!', {
          id: loadingToast,
        });

        const updatedCampaigns = await fetchUserCampaigns(program, publicKey);
        setCampaigns(updatedCampaigns);
      } else {
        toast.error(`Failed to withdraw funds: ${result.error}`, {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast.error('Failed to withdraw funds');
    } finally {
      setIsWithdrawing(false);
      setWithdrawingCampaignId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#000000] dark:via-[#0a0e27] dark:to-[#000000] p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h1 className="text-5xl font-bold mb-3 text-black dark:text-white">
              My Campaigns
            </h1>
            <p className="text-gray-600 dark:text-white/60 text-lg">
              Manage your fundraising campaigns
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => navigate('/create-campaign')}
              className="glass-button bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 h-14 px-8 rounded-xl font-semibold text-lg shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Campaign
            </Button>
          </motion.div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-white/60">Loading your campaigns...</p>
            </div>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-12 text-center"
          >
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
          </motion.div>
        ) : campaigns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-16 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-black/10 dark:bg-white/10 flex items-center justify-center">
              <Plus className="w-10 h-10 text-black dark:text-white" />
            </div>
            <h3 className="text-2xl font-bold text-black dark:text-white mb-2">No Campaigns Yet</h3>
            <p className="text-gray-600 dark:text-white/60 mb-8 text-lg">Start your first fundraising campaign today!</p>
            <Button
              onClick={() => navigate('/create-campaign')}
              className="bg-black dark:bg-white text-white dark:text-black rounded-xl px-8 py-6 text-lg font-semibold"
            >
              Create Your First Campaign
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign, index) => {
              const isExpired = new Date(campaign.deadline) < new Date();
              const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)));
              const progressPercentage = Math.min(100, (campaign.amountRaised / campaign.goalAmount) * 100);
              const campaignId = campaign.publicKey.toString();
              const canWithdraw = campaign.isActive && (campaign.amountRaised >= campaign.goalAmount || isExpired);

              return (
                <motion.div
                  key={campaignId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl"
                >
                  <div className="p-6 cursor-pointer" onClick={() => navigate(`/campaign/${campaignId}`)}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-black dark:text-white flex-1 group-hover:text-black/80 dark:group-hover:text-white/80 transition-colors">
                        {campaign.title}
                      </h3>
                      <span className={`ml-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        campaign.isActive
                          ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border border-black/20 dark:border-white/20'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
                      }`}>
                        {campaign.isActive ? 'Active' : 'Ended'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-white/60 line-clamp-2 mb-6">
                      {campaign.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-white/60 font-medium">
                          {campaign.amountRaised.toFixed(2)} / {campaign.goalAmount.toFixed(2)} SOL
                        </span>
                        <span className="text-black dark:text-white font-bold">
                          {progressPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full bg-black dark:bg-white rounded-full"
                        />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-white/40">
                        <Clock className="w-3 h-3" />
                        <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
                      </div>
                    </div>
                  </div>

                  {canWithdraw && (
                    <div className="px-6 pb-6">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWithdraw(campaignId);
                        }}
                        disabled={isWithdrawing && withdrawingCampaignId === campaignId}
                        variant="outline"
                        className="w-full rounded-xl border-2 border-black dark:border-white"
                      >
                        {isWithdrawing && withdrawingCampaignId === campaignId ? 'Processing...' : 'Withdraw Funds'}
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCampaigns;
