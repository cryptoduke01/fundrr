import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
// import Header from '../components/Header';
import { CampaignService } from '../services/campaign';
import { useAnchorProgram } from '../hooks/useAnchorProgram';
import { toast } from 'react-hot-toast';

const CAMPAIGN_CATEGORIES = [
  { value: 'development', label: 'Development' },
  { value: 'video_creation', label: 'Video Creation' },
  { value: 'defi', label: 'DeFi Project' },
  { value: 'nft', label: 'NFT Project' },
  { value: 'dao', label: 'DAO' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'infrastructure', label: 'Web3 Infrastructure' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' }
];

const CreateCampaign = () => {
  const { publicKey, connected } = useWallet();
  const navigate = useNavigate();
  const program = useAnchorProgram();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    currency: 'SOL', // Default to SOL
    deadline: '',
    category: '',
    image: null
  });

  // Redirect if not connected
  if (!connected) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!program || !publicKey) return;

    // Validate word limits
    if (formData.title.split(' ').length > 10) {
      toast.error('Title should not exceed 10 words');
      return;
    }
    if (formData.description.split(' ').length > 100) {
      toast.error('Description should not exceed 100 words');
      return;
    }

    setIsSubmitting(true);
    const campaignService = new CampaignService(program, publicKey);

    try {
      const loadingToast = toast.loading('Creating your campaign...');

      // Calculate duration in days from deadline
      const deadline = new Date(formData.deadline);
      const now = new Date();
      const duration = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

      // Create campaign on-chain
      const campaignAddress = await campaignService.createCampaign(
        formData.title,
        formData.description,
        parseFloat(formData.goalAmount),
        duration,
        formData.currency,
        formData.category
      );

      toast.success('Campaign created successfully!', {
        id: loadingToast,
      });

      // Navigate to the campaign details page
      navigate(`/campaign/${campaignAddress.toString()}`);
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get minimum date (today) and maximum date (1 year from now) for deadline
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="flex-1">
      {/* <Header /> */}
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <h1 className="text-3xl font-bold text-white mb-8">Create Campaign</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Campaign Title (max 10 words)
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Enter campaign title"
              required
            />
            <p className="mt-1 text-sm text-gray-400">
              {formData.title.split(' ').filter(word => word.length > 0).length}/10 words
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Campaign Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              required
            >
              <option value="">Select a category</option>
              {CAMPAIGN_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (max 100 words)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 h-32"
              placeholder="Enter campaign description"
              required
            />
            <p className="mt-1 text-sm text-gray-400">
              {formData.description.split(' ').filter(word => word.length > 0).length}/100 words
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Funding Goal
              </label>
              <div className="flex">
                <input
                  type="number"
                  name="goalAmount"
                  value={formData.goalAmount}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Enter funding goal"
                  min="0.1"
                  step="0.1"
                  required
                />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 border-l-0 rounded-r-lg text-white focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="SOL">SOL</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Campaign Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                min={today}
                max={maxDateStr}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Campaign Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg hover:border-purple-500 transition-colors">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-purple-500 hover:text-purple-400"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files[0] }))}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Campaign...' : 'Create Campaign'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign; 