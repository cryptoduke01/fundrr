import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
// import Header from '../components/Header';
import { CampaignService } from '../services/campaign';
import { useAnchorProgram } from '../hooks/useAnchorProgram';
import { toast } from 'react-hot-toast';

const DiscoverCampaigns = () => {
  const { publicKey, connected } = useWallet();
  const navigate = useNavigate();
  const program = useAnchorProgram();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, ended

  useEffect(() => {
    if (program && publicKey) {
      loadCampaigns();
    }
  }, [program, publicKey]);

  const loadCampaigns = async () => {
    try {
      const campaignService = new CampaignService(program, publicKey);
      const campaignData = await campaignService.getAllCampaigns();
      setCampaigns(campaignData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCampaigns = campaigns
    .filter(campaign => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase());

      const isActive = new Date(campaign.deadline) > new Date() && campaign.isActive;

      if (filter === 'active') return matchesSearch && isActive;
      if (filter === 'ended') return matchesSearch && !isActive;
      return matchesSearch;
    })
    .sort((a, b) => new Date(b.deadline) - new Date(a.deadline));

  return (
    <div className="flex-1">
      {/* <Header /> */}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Discover Campaigns</h1>
          <button
            onClick={() => navigate('/create')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Create Campaign
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search campaigns..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Campaigns</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No campaigns found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign, index) => {
              const isExpired = new Date(campaign.deadline) < new Date();
              const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

              return (
                <div
                  key={index}
                  className="bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-transform cursor-pointer"
                  onClick={() => navigate(`/campaign/${campaign.id}`)}
                >
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
                      <div className="text-gray-400 font-mono truncate" style={{ maxWidth: '140px' }}>
                        {campaign.creator.toString().slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverCampaigns; 