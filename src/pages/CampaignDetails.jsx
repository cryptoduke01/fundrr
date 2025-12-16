import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useProgram } from '../contexts/ProgramContext';
import {
  fetchCampaign,
  contributeToCampaign,
  withdrawFunds
} from '../utils/programHelpers';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const program = useProgram();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const loadCampaign = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!program) {
          setError('Program not initialized. Please ensure your wallet is connected and the program is deployed.');
          setLoading(false);
          return;
        }

        if (connected && program && publicKey) {
          const campaignData = await fetchCampaign(program, id, publicKey);
          setCampaign(campaignData);
        }
      } catch (error) {
        console.error('Error loading campaign:', error);
        setError(error.message || 'Failed to load campaign details. Make sure the program is deployed.');
      } finally {
        setLoading(false);
      }
    };

    if (connected && program && publicKey) {
      loadCampaign();
    } else if (!connected) {
      setLoading(false);
    }
  }, [id, connected, program, publicKey]);

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

  const getDaysRemaining = (deadline) => {
    if (!deadline) return 0;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#000000] dark:via-[#0a0e27] dark:to-[#000000] flex justify-center items-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-white/60">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#000000] dark:via-[#0a0e27] dark:to-[#000000] p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-white/60 hover:text-black dark:hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="glass-card rounded-2xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-black dark:text-white mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl font-bold text-black dark:text-white mb-3">Campaign Not Found</h2>
            <p className="text-gray-600 dark:text-white/60 mb-6">{error || 'The campaign you\'re looking for doesn\'t exist.'}</p>
            {error && (
              <p className="text-gray-600 dark:text-white/60 mb-6 text-sm">Make sure the program is deployed: <code className="font-mono bg-black/5 dark:bg-white/5 px-2 py-1 rounded">2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu</code></p>
            )}
            <Button
              onClick={() => navigate('/discover')}
              className="bg-black dark:bg-white text-white dark:text-black rounded-xl"
            >
              Discover Campaigns
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(campaign.deadline);
  const isActive = campaign.isActive;
  const progressPercentage = Math.min(100, (campaign.amountRaised / campaign.goalAmount) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#000000] dark:via-[#0a0e27] dark:to-[#000000] p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-white/60 hover:text-black dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-5xl font-bold mb-4 text-black dark:text-white">{campaign.title}</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-white/60 font-mono">By {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}</span>
            <span className={`px-4 py-2 rounded-full text-xs font-semibold ${
              isActive
                ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border border-black/20 dark:border-white/20'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
            }`}>
              {isActive ? 'Active' : 'Ended'}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
                About This Campaign
              </h2>
              <p className="text-gray-600 dark:text-white/60 whitespace-pre-line leading-relaxed text-lg">
                {campaign.description}
              </p>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-3 text-sm">
                    <span className="text-gray-600 dark:text-white/60 font-medium">Progress</span>
                    <span className="text-black dark:text-white font-bold">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-black dark:bg-white rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-3xl font-bold text-black dark:text-white mb-2">
                    {campaign.amountRaised.toFixed(2)} SOL
                  </p>
                  <p className="text-sm text-gray-600 dark:text-white/60">
                    of {campaign.goalAmount.toFixed(2)} SOL goal
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{daysRemaining} days left</span>
                </div>
              </div>
            </motion.div>

            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-2xl p-8"
              >
                <h2 className="text-xl font-bold text-black dark:text-white mb-6">
                  Support this campaign
                </h2>
                {connected ? (
                  <form onSubmit={handleContribute} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-black dark:text-white mb-3 uppercase tracking-wide">
                        Amount (SOL)
                      </label>
                      <input
                        type="number"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        placeholder="0.0"
                        step="0.01"
                        min="0.01"
                        className="glass w-full px-5 py-4 rounded-xl text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-lg"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 rounded-xl py-6 text-lg font-semibold shadow-xl"
                    >
                      {isSubmitting ? 'Processing...' : 'Contribute'}
                    </Button>
                  </form>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-white/60 text-center py-4">
                    Connect your wallet to contribute
                  </p>
                )}
              </motion.div>
            )}

            {campaign.isCreator && isActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card rounded-2xl p-8"
              >
                <h2 className="text-xl font-bold text-black dark:text-white mb-6">
                  Creator Actions
                </h2>
                <Button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  variant="outline"
                  className="w-full rounded-xl border-2 border-black dark:border-white py-6"
                >
                  {isWithdrawing ? 'Processing...' : 'Withdraw Funds'}
                </Button>
                <p className="text-xs text-gray-600 dark:text-white/60 mt-4">
                  You can withdraw funds if the campaign has met its goal or has ended.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
