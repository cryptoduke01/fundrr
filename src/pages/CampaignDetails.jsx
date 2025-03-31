import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import Header from '../components/Header';
import { CampaignService } from '../services/campaign';
import { useAnchorProgram } from '../hooks/useAnchorProgram';
import { toast } from 'react-hot-toast';

const CampaignDetails = () => {
  const { publicKey, connected } = useWallet();
  const navigate = useNavigate();
  const program = useAnchorProgram();
  const [campaign, setCampaign] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isContributing, setIsContributing] = useState(false);

  useEffect(() => {
    if (program && publicKey) {
      loadCampaignDetails();
    }
  }, [program, publicKey]);

  const loadCampaignDetails = async () => {
    try {
      const campaignService = new CampaignService(program, publicKey);
      const campaignData = await campaignService.getCampaign(id);
      setCampaign(campaignData);
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast.error('Failed to load campaign details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsContributing(true);
    try {
      const campaignService = new CampaignService(program, publicKey);
      const loadingToast = toast.loading('Processing contribution...');

      await campaignService.contribute(id, parseFloat(contributionAmount));

      toast.success('Contribution successful!', {
        id: loadingToast,
      });

      // Reload campaign details
      await loadCampaignDetails();
      setContributionAmount('');
    } catch (error) {
      console.error('Error contributing:', error);
      toast.error('Failed to process contribution');
    } finally {
      setIsContributing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <div className="flex-1 p-8">
          <Header />
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <div className="flex-1 p-8">
          <Header />
          <div className="text-center text-white mt-20">
            <h2 className="text-2xl font-bold">Campaign not found</h2>
            <button
              onClick={() => navigate('/discover')}
              className="mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              Browse Campaigns
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = new Date(campaign.deadline) < new Date();
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="flex min-h-screen bg-slate-950">
      <div className="flex-1 p-8">
        <Header />

        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            {/* Campaign Image */}
            <div className="h-64 bg-gray-700 flex items-center justify-center">
              {campaign.imageUrl ? (
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-24 h-24 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>

            {/* Campaign Details */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">{campaign.title}</h1>
                <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                  {campaign.category}
                </span>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress ({((campaign.amountRaised / campaign.goalAmount) * 100).toFixed(1)}%)</span>
                  <span>{campaign.amountRaised} / {campaign.goalAmount} {campaign.currency}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full"
                    style={{ width: `${Math.min(100, (campaign.amountRaised / campaign.goalAmount) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-2">About the Campaign</h2>
                <p className="text-gray-300">{campaign.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Creator</p>
                  <p className="text-white font-mono">{campaign.creator.toString()}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Deadline</p>
                  <p className="text-white">
                    {new Date(campaign.deadline).toLocaleDateString()} ({daysLeft} days left)
                  </p>
                </div>
              </div>

              {/* Contribution Form */}
              {!isExpired && campaign.isActive && (
                <form onSubmit={handleContribute} className="mt-6">
                  <div className="flex gap-4">
                    <input
                      type="number"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      placeholder={`Amount in ${campaign.currency}`}
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      min="0.1"
                      step="0.1"
                      required
                    />
                    <button
                      type="submit"
                      className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isContributing || !connected}
                    >
                      {isContributing ? 'Contributing...' : 'Contribute'}
                    </button>
                  </div>
                </form>
              )}

              {isExpired && (
                <div className="mt-6 p-4 bg-red-900/20 border border-red-900 rounded-lg">
                  <p className="text-red-400">This campaign has ended</p>
                </div>
              )}

              {!campaign.isActive && (
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <p className="text-gray-300">This campaign is no longer active</p>
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