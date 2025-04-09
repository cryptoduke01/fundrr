import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { Clock, Users, Target, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchCampaign, contributeToCampaign, withdrawFunds } from '../utils/CampaignFunctions';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { connected, wallet, publicKey } = useWallet();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contributionAmount, setContributionAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Fetch campaign data
  useEffect(() => {
    const loadCampaign = async () => {
      try {
        if (connected && wallet) {
          const campaignData = await fetchCampaign(wallet, parseInt(id),
            // For demo purposes, we'll just use the current wallet to simplify things
            wallet.publicKey.toString()
          );
          setCampaign(campaignData);
        }
      } catch (error) {
        console.error('Error loading campaign:', error);
        toast.error('Failed to load campaign details');
      } finally {
        setLoading(false);
      }
    };

    if (connected && wallet) {
      loadCampaign();
    }
  }, [id, connected, wallet]);

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
        wallet,
        parseInt(id),
        campaign.author,
        parseFloat(contributionAmount)
      );

      if (result.success) {
        toast.success('Contribution successful!', { id: toastId });
        setContributionAmount('');

        // Refresh campaign data after contribution
        const updatedCampaign = await fetchCampaign(wallet, parseInt(id), campaign.author);
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

    if (!campaign.isAuthor) {
      toast.error('Only the campaign creator can withdraw funds');
      return;
    }

    setIsWithdrawing(true);
    try {
      const toastId = toast.loading('Withdrawing funds...');

      const result = await withdrawFunds(
        wallet,
        parseInt(id)
      );

      if (result.success) {
        toast.success('Funds withdrawn successfully!', { id: toastId });

        // Refresh campaign data after withdrawal
        const updatedCampaign = await fetchCampaign(wallet, parseInt(id), campaign.author);
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
    const percentage = (campaign.raisedAmount / campaign.goalAmount) * 100;
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
  const isActive = campaign.status === 'active';
  const isFunded = campaign.status === 'funded';
  const isCompleted = campaign.status === 'completed';
  const isCancelled = campaign.status === 'cancelled';
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
        <h1 className="text-3xl font-bold text-white mb-2">{campaign.name}</h1>
        <div className="flex items-center gap-4 text-gray-400 text-sm">
          <span>By {campaign.author.slice(0, 6)}...{campaign.author.slice(-4)}</span>
          <span>Created on {formatDate(campaign.createdAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Campaign image and details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800/50">
            <img
              src={campaign.imageUrl}
              alt={campaign.name}
              className="w-full h-[300px] sm:h-[400px] object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/600x400?text=Campaign+Image';
              }}
            />
          </div>

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
              <div className={`px-4 py-2 rounded-xl text-sm font-medium 
                ${isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  isFunded ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    isCompleted ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {isActive ? 'Active' :
                  isFunded ? 'Funded' :
                    isCompleted ? 'Completed' :
                      'Cancelled'}
              </div>

              {hasEnded ? (
                <div className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                  Campaign Ended
                </div>
              ) : (
                <div className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Funding info and contribute form */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Raised</span>
                <span className="text-white font-semibold">{campaign.raisedAmount.toFixed(2)} SOL</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3 mb-1">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">{progressPercentage.toFixed(0)}%</span>
                <span className="text-gray-400">Goal: {campaign.goalAmount.toFixed(2)} SOL</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                <Clock className="w-5 h-5 mx-auto mb-2 text-purple-500" />
                <div className="text-lg font-bold text-white">{daysRemaining}</div>
                <div className="text-xs text-gray-400">Days Left</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                <Users className="w-5 h-5 mx-auto mb-2 text-purple-500" />
                <div className="text-lg font-bold text-white">{campaign.contributorsCount}</div>
                <div className="text-xs text-gray-400">Contributors</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3 text-center sm:col-span-1 col-span-2">
                <Target className="w-5 h-5 mx-auto mb-2 text-purple-500" />
                <div className="text-lg font-bold text-white">{campaign.goalAmount.toFixed(2)}</div>
                <div className="text-xs text-gray-400">Goal (SOL)</div>
              </div>
            </div>

            {/* Contribute form */}
            {isActive && !campaign.isAuthor && (
              <form onSubmit={handleContribute} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Contribution Amount (SOL)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    placeholder="e.g. 0.5"
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !connected}
                  className={`w-full p-3 rounded-xl text-white font-medium transition-colors ${isSubmitting || !connected
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                    }`}
                  whileHover={!isSubmitting && connected ? { scale: 1.03 } : {}}
                  whileTap={!isSubmitting && connected ? { scale: 0.97 } : {}}
                >
                  {isSubmitting ? 'Processing...' : 'Contribute to Campaign'}
                </motion.button>
                {!connected && (
                  <p className="text-sm text-red-400 text-center">Connect your wallet to contribute</p>
                )}
              </form>
            )}

            {/* Withdraw funds button for campaign owner */}
            {(isFunded || (isActive && daysRemaining === 0)) && campaign.isAuthor && (
              <motion.button
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className={`w-full p-3 rounded-xl text-white font-medium transition-colors ${isWithdrawing
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                  }`}
                whileHover={!isWithdrawing ? { scale: 1.03 } : {}}
                whileTap={!isWithdrawing ? { scale: 0.97 } : {}}
              >
                {isWithdrawing ? 'Processing...' : 'Withdraw Funds'}
              </motion.button>
            )}

            {/* Campaign ended message */}
            {hasEnded && !campaign.isAuthor && (
              <div className="text-center p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                <p className="text-yellow-400 mb-1">Campaign has ended</p>
                <p className="text-sm text-gray-400">
                  {isFunded || isCompleted
                    ? 'This campaign was successfully funded!'
                    : 'This campaign did not reach its funding goal.'}
                </p>
              </div>
            )}

            {/* Already withdrawn message */}
            {isCompleted && campaign.isAuthor && (
              <div className="text-center p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                <p className="text-green-400 mb-1">Funds withdrawn</p>
                <p className="text-sm text-gray-400">
                  You have successfully withdrawn the funds from this campaign.
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 mb-3">
              Campaign Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div>
                  <p className="text-white font-medium">Campaign Created</p>
                  <p className="text-sm text-gray-400">{formatDate(campaign.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full ${hasEnded ? 'bg-green-500/20 border border-green-500/50' : 'bg-gray-700/50 border border-gray-600/50'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  {hasEnded ? (
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  )}
                </div>
                <div>
                  <p className={`font-medium ${hasEnded ? 'text-white' : 'text-gray-400'}`}>
                    Campaign {hasEnded ? 'Ended' : 'Ends'}
                  </p>
                  <p className="text-sm text-gray-400">{formatDate(campaign.deadline)}</p>
                </div>
              </div>

              {(isFunded || isCompleted) && (
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full ${isFunded || isCompleted ? 'bg-green-500/20 border border-green-500/50' : 'bg-gray-700/50 border border-gray-600/50'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {isFunded || isCompleted ? (
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${isFunded || isCompleted ? 'text-white' : 'text-gray-400'}`}>
                      Funding Goal Reached
                    </p>
                    <p className="text-sm text-gray-400">
                      {progressPercentage.toFixed(0)}% of {campaign.goalAmount.toFixed(2)} SOL
                    </p>
                  </div>
                </div>
              )}

              {isCompleted && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div>
                    <p className="text-white font-medium">Funds Withdrawn</p>
                    <p className="text-sm text-gray-400">Campaign completed successfully</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails; 