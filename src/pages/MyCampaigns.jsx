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

  const CampaignCard = ({ campaign }) => {
    const navigate = useNavigate();
    const daysLeft = Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24));

    return (
      <div
        className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-transform"
        onClick={() => navigate(`/campaign/${campaign.id}`)}
      >
        {/* Campaign Image */}
        <div className="h-48 bg-gray-700 flex items-center justify-center">
          {campaign.imageUrl ? (
            <img
              src={campaign.imageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white truncate">{campaign.title}</h3>
            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs">
              {campaign.category}
            </span>
          </div>

          <p className="text-gray-400 text-sm line-clamp-2 mb-4">{campaign.description}</p>

          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress ({((campaign.amountRaised / campaign.goalAmount) * 100).toFixed(1)}%)</span>
              <span>{campaign.amountRaised} / {campaign.goalAmount} {campaign.currency}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${Math.min(100, (campaign.amountRaised / campaign.goalAmount) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-400">
              {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
            </div>
            <div className={`px-2 py-1 rounded text-xs ${campaign.isActive ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
              {campaign.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>
    );
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
              <CampaignCard key={campaign.publicKey.toString()} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCampaigns; 