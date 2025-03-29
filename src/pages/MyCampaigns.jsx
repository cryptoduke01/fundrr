import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
// import Header from '../components/Header';
import { CampaignService } from '../services/campaign';
import { useAnchorProgram } from '../hooks/useAnchorProgram';
import { toast } from 'react-hot-toast';

const MyCampaigns = () => {
  const { publicKey, connected } = useWallet();
  const navigate = useNavigate();
  const program = useAnchorProgram();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected) {
      navigate('/');
      return;
    }

    if (program && publicKey) {
      loadMyCampaigns();
    }
  }, [program, publicKey, connected]);

  const loadMyCampaigns = async () => {
    try {
      const campaignService = new CampaignService(program, publicKey);
      const campaignData = await campaignService.getMyCampaigns();
      setCampaigns(campaignData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load your campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (campaignAddress) => {
    if (isWithdrawing) return;

    setIsWithdrawing(true);
    setLoading(true);
    try {
      const campaignService = new CampaignService(program, publicKey);
      const loadingToast = toast.loading('Processing withdrawal...');

      await campaignService.withdrawFunds(campaignAddress);

      toast.success('Funds withdrawn successfully!', {
        id: loadingToast,
      });

      // Reload campaigns to update status
      await loadMyCampaigns();
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast.error('Failed to withdraw funds');
    } finally {
      setIsWithdrawing(false);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1">
      {/* <Header /> */}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">My Campaigns</h1>
          <button
            onClick={() => navigate('/create')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Create Campaign
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-2">No Campaigns Yet</h3>
            <p className="text-gray-400 mb-6">Start your first fundraising campaign today!</p>
            <button
              onClick={() => navigate('/create')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Your First Campaign
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.publicKey.toString()}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
                    <p className="text-gray-600 mb-4">{campaign.description}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Goal</p>
                    <p className="font-semibold">{campaign.goalAmount.toFixed(2)} SOL</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Raised</p>
                    <p className="font-semibold">{campaign.amountRaised.toFixed(2)} SOL</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Deadline</p>
                    <p className="font-semibold">
                      {new Date(campaign.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (campaign.amountRaised / campaign.goalAmount) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => navigate(`/campaign/${campaign.publicKey.toString()}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                  {campaign.isActive && (
                    <button
                      onClick={() => handleWithdraw(campaign.publicKey)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Withdraw Funds'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCampaigns; 