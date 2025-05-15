import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
// import Header from '../components/Header';
import { toast } from 'react-hot-toast';
import { useProgram } from '../contexts/ProgramContext';
import { fetchUserCampaigns, withdrawFunds } from '../utils/programHelpers';

const MyCampaigns = () => {
  const { publicKey, connected } = useWallet();
  const navigate = useNavigate();
  const program = useProgram();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawingCampaignId, setWithdrawingCampaignId] = useState(null);

  useEffect(() => {
    if (!connected) {
      navigate('/');
      return;
    }

    const loadMyCampaigns = async () => {
      try {
        if (program && publicKey) {
          const campaignData = await fetchUserCampaigns(program, publicKey);
          setCampaigns(campaignData);
        }
      } catch (error) {
        console.error('Error loading campaigns:', error);
        toast.error('Failed to load your campaigns');
      } finally {
        setIsLoading(false);
      }
    };

    if (program && publicKey) {
      loadMyCampaigns();
    }
  }, [program, publicKey, connected, navigate]);

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

        // Reload campaigns to update status
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
    <div className="flex-1">
      {/* <Header /> */}

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">My Campaigns</h1>
          <button
            onClick={() => navigate('/create-campaign')}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-colors"
          >
            Create Campaign
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800/50">
            <h3 className="text-xl font-semibold text-white mb-2">No Campaigns Yet</h3>
            <p className="text-gray-400 mb-6">Start your first fundraising campaign today!</p>
            <button
              onClick={() => navigate('/create-campaign')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-colors"
            >
              Create Your First Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const isExpired = new Date(campaign.deadline) < new Date();
              const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)));
              const progressPercentage = Math.min(100, (campaign.amountRaised / campaign.goalAmount) * 100);
              const campaignId = campaign.publicKey.toString();
              const canWithdraw = campaign.isActive && (campaign.amountRaised >= campaign.goalAmount || isExpired);

              return (
                <div
                  key={campaignId}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800/50 hover:transform hover:scale-[1.02] transition-transform"
                >
                  <div className="p-4 cursor-pointer" onClick={() => navigate(`/campaign/${campaignId}`)}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white truncate">{campaign.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${campaign.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {campaign.isActive ? 'Active' : 'Ended'}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">{campaign.description}</p>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress ({progressPercentage.toFixed(1)}%)</span>
                        <span>{campaign.amountRaised.toFixed(2)} / {campaign.goalAmount.toFixed(2)} SOL</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-400">
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                      </div>
                    </div>
                  </div>

                  {canWithdraw && (
                    <div className="px-4 pb-4">
                      <button
                        onClick={() => handleWithdraw(campaignId)}
                        disabled={isWithdrawing && withdrawingCampaignId === campaignId}
                        className={`w-full py-2 rounded-lg text-white text-sm ${isWithdrawing && withdrawingCampaignId === campaignId
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                          } transition-colors`}
                      >
                        {isWithdrawing && withdrawingCampaignId === campaignId ? 'Processing...' : 'Withdraw Funds'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCampaigns; 