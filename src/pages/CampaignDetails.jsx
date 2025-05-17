import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { Clock, Users, Target, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useProgram } from '../contexts/ProgramContext';
import {
  fetchCampaign,
  contributeToCampaign,
  withdrawFunds
} from '../utils/programHelpers';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const program = useProgram();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contributionAmount, setContributionAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Fetch campaign data
  useEffect(() => {
    const loadCampaign = async () => {
      try {
        if (connected && program && publicKey) {
          const campaignData = await fetchCampaign(program, id, publicKey);
          setCampaign(campaignData);
        }
      } catch (error) {
        console.error('Error loading campaign:', error);
        toast.error('Failed to load campaign details');
      } finally {
        setLoading(false);
      }
    };

    if (connected && program && publicKey) {
      loadCampaign();
    }
  }, [id, connected, program, publicKey]);

  // Handle contribution
  const handleContribute = async (e) => {
    e.preventDefault();

    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!contributionAmount || isNaN(contributionAmount) || parseFloat(contributionAmount) <= 0) {
      toast.error('Please enter a valid contribution amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const toastId = toast.loading('Processing your contribution...');

      const result = await contributeToCampaign(
        program,
        { publicKey },
        id,
        parseFloat(contributionAmount)
      );

      if (result.success) {
        toast.success('Contribution successful!', { id: toastId });
        setContributionAmount('');

        // Refresh campaign data after contribution
        const updatedCampaign = await fetchCampaign(program, id, publicKey);
        setCampaign(updatedCampaign);
      } else {
        toast.error(`Failed to contribute: ${result.error}`, { id: toastId });
      }
    } catch (error) {
      console.error('Error contributing to campaign:', error);
      toast.error('An error occurred while processing your contribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle fund withdrawal
  const handleWithdraw = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!campaign.isCreator) {
      toast.error('Only the campaign creator can withdraw funds');
      return;
    }

    setIsWithdrawing(true);
    try {
      const toastId = toast.loading('Withdrawing funds...');

      const result = await withdrawFunds(
        program,
        { publicKey },
        id
      );

      if (result.success) {
        toast.success('Funds withdrawn successfully!', { id: toastId });

        // Refresh campaign data after withdrawal
        const updatedCampaign = await fetchCampaign(program, id, publicKey);
        setCampaign(updatedCampaign);
      } else {
        toast.error(`Failed to withdraw funds: ${result.error}`, { id: toastId });
      }
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast.error('An error occurred while withdrawing funds');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Format deadline to readable date
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (deadline) => {
    if (!deadline) return 0;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    const daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    return daysRemaining;
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!campaign) return 0;
    const percentage = (campaign.amountRaised / campaign.goalAmount) * 100;
    return Math.min(100, percentage);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="p-8 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800/50">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Campaign Not Found</h2>
          <p className="text-gray-400 mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/discover')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-medium"
          >
            Discover Campaigns
          </button>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(campaign.deadline);
  const isActive = campaign.isActive;
  const hasEnded = daysRemaining === 0 || !isActive;
  const progressPercentage = getProgressPercentage();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white mb-4 flex items-center gap-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">{campaign.title}</h1>
        <div className="flex items-center gap-4 text-gray-400 text-sm">
          <span>By {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Campaign image and details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Image */}
          {campaign.imageUrl && (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800/50">
              <img
                src={campaign.imageUrl}
                alt={campaign.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/600x400?text=Image+Not+Available';
                }}
              />
            </div>
          )}

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 mb-4">
              About This Campaign
            </h2>
            <p className="text-gray-300 whitespace-pre-line">{campaign.description}</p>
          </div>

          {/* Status badge */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 mb-4">
              Campaign Status
            </h2>
            <div className="flex flex-wrap gap-4">
              <div className={`px-4 py-2 rounded-xl text-sm font-medium ${isActive
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {isActive ? 'Active' : 'Ended'}
              </div>

              {hasEnded ? (
                <div className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                  Campaign Ended
                </div>
              ) : (
                <div className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {daysRemaining} days remaining
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Funding status and contribution */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-gray-400">{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{campaign.amountRaised.toFixed(2)} SOL</p>
                  <p className="text-gray-400 text-sm">of {campaign.goalAmount.toFixed(2)} SOL goal</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <p className="text-gray-400 text-sm">{daysRemaining} days left</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contribute form */}
          {isActive && (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
              <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 mb-4">
                Support this campaign
              </h2>
              {connected ? (
                <form onSubmit={handleContribute} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Contribution Amount (SOL)</label>
                    <div className="flex">
                      <input
                        type="number"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        placeholder="e.g. 0.5"
                        step="0.01"
                        min="0.01"
                        className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-l-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        required
                      />
                      <div className="p-3 bg-gray-800 border border-l-0 border-gray-700 rounded-r-xl text-gray-400">
                        SOL
                      </div>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-xl text-white ${isSubmitting
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                      } transition-colors`}
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? 'Processing...' : 'Contribute Now'}
                  </motion.button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 mb-4">Connect your wallet to contribute to this campaign</p>
                </div>
              )}
            </div>
          )}

          {/* Withdraw funds button for campaign creator */}
          {campaign.isCreator && isActive && (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
              <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 mb-4">
                Creator Actions
              </h2>
              <motion.button
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className={`w-full py-3 rounded-xl text-white ${isWithdrawing
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                  } transition-colors`}
                whileHover={!isWithdrawing ? { scale: 1.02 } : {}}
                whileTap={!isWithdrawing ? { scale: 0.98 } : {}}
              >
                {isWithdrawing ? 'Processing...' : 'Withdraw Funds'}
              </motion.button>
              <p className="text-gray-400 text-sm mt-2">
                You can withdraw funds if the campaign has met its goal or has ended.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails; 