import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
// import Header from '../components/Header';
import { toast } from 'react-hot-toast';
import { useProgram } from '../contexts/ProgramContext';
import { fetchAllCampaigns } from '../utils/programHelpers';

const DiscoverCampaigns = () => {
  const { publicKey, connected } = useWallet();
  const navigate = useNavigate();
  const program = useProgram();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, ended

  useEffect(() => {
  const loadCampaigns = async () => {
    try {
        if (program && publicKey) {
          const campaignData = await fetchAllCampaigns(program, publicKey);
      setCampaigns(campaignData);
        }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

    if (program && publicKey) {
      loadCampaigns();
    }
  }, [program, publicKey]);

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

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Discover Campaigns</h1>
          <button
            onClick={() => navigate('/create-campaign')}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-colors"
          >
            Create Campaign
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search campaigns..."
            className="flex-1 px-4 py-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="all">All Campaigns</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800/50">
            <p className="text-gray-400">No campaigns found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => {
              const isExpired = new Date(campaign.deadline) < new Date();
              const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)));
              const progressPercentage = Math.min(100, (campaign.amountRaised / campaign.goalAmount) * 100);

              return (
                <div
                  key={campaign.publicKey.toString()}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800/50 hover:transform hover:scale-[1.02] transition-transform cursor-pointer"
                  onClick={() => navigate(`/campaign/${campaign.publicKey.toString()}`)}
                >
                  <div className="p-4">
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
                      <div className="text-gray-400 font-mono truncate" style={{ maxWidth: '140px' }}>
                        By: {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
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