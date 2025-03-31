import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
// import Header from '../components/Header';
import { CampaignService } from '../services/campaign';
import { useAnchorProgram } from '../hooks/useAnchorProgram';
import { toast } from 'react-hot-toast';

const NFT_STORAGE_API_KEY = 'e29f0813.2533a83c54534dab98fc0c8ab5c45265';

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
    duration: 30, // Default to 30 days
    category: '',
    image: null
  });

  // Redirect if not connected
  if (!connected) {
    navigate('/');
    return null;
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Update preview
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const uploadToIPFS = async (file, metadata) => {
    try {
      // First upload the image
      const imageFormData = new FormData();
      imageFormData.append('file', file);

      const imageResponse = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NFT_STORAGE_API_KEY}`,
        },
        body: imageFormData
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to upload image to IPFS');
      }

      const imageData = await imageResponse.json();
      const imageUrl = `https://ipfs.io/ipfs/${imageData.value.cid}`;

      // Then upload the metadata
      const metadataWithImage = {
        ...metadata,
        imageUrl
      };

      const metadataBlob = new Blob([JSON.stringify(metadataWithImage)], { type: 'application/json' });
      const metadataFormData = new FormData();
      metadataFormData.append('file', metadataBlob);

      const metadataResponse = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NFT_STORAGE_API_KEY}`,
        },
        body: metadataFormData
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to upload metadata to IPFS');
      }

      const metadataData = await metadataResponse.json();
      return `https://ipfs.io/ipfs/${metadataData.value.cid}`;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading('Creating campaign...');

    try {
      // Upload image and metadata to IPFS
      const metadataUrl = await uploadToIPFS(formData.image, {
        title: formData.title,
        description: formData.description,
        category: formData.category
      });

      // Create campaign
      const campaignService = new CampaignService(program, publicKey);
      const campaignAddress = await campaignService.createCampaign(
        formData.title,
        metadataUrl,
        parseFloat(formData.goalAmount),
        parseInt(formData.duration),
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
      toast.error('Failed to create campaign: ' + error.message, {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1">
      {/* <Header /> */}
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <h1 className="text-3xl font-bold text-white mb-8">Create Campaign</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Campaign Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Enter campaign title"
              required
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Campaign Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
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
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 h-32"
              placeholder="Enter campaign description"
              required
              rows={4}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Funding Goal (SOL)
              </label>
              <input
                type="number"
                name="goalAmount"
                value={formData.goalAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, goalAmount: e.target.value }))}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter funding goal"
                min="0.1"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Campaign Duration (days)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                required
                min="1"
                max="365"
                placeholder="Enter campaign duration in days"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Campaign Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg hover:border-purple-500 transition-colors">
              <div className="space-y-1 text-center">
                {formData.image ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Campaign preview"
                      className="mx-auto h-32 w-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
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
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 mt-6">
            <h3 className="text-lg font-medium text-white mb-2">Transaction Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Network</span>
                <span className="text-white">Solana Devnet</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estimated Gas Fee</span>
                <span className="text-white">~0.000005 SOL</span>
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