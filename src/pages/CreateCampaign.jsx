import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Calendar, Target, FileText, Tags, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
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

export function CreateCampaign() {
  const { publicKey, connected } = useWallet();
  const navigate = useNavigate();
  const program = useAnchorProgram();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    goal: '',
    endDate: '',
    image: null
  });

  // Redirect if not connected
  if (!connected) {
    navigate('/');
    return null;
  }

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
        parseFloat(formData.goal),
        parseInt(formData.endDate),
        'SOL',
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    }
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

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-[1000px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Create Campaign
          </h1>
          <p className="mt-2 text-slate-400">
            Launch your crowdfunding campaign and start making an impact
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Campaign Image Upload */}
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="campaign-image"
            />
            <label
              htmlFor="campaign-image"
              className="block aspect-video rounded-2xl bg-slate-800/50 border-2 border-dashed border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer overflow-hidden"
            >
              {formData.image ? (
                <img
                  src={URL.createObjectURL(formData.image)}
                  alt="Campaign preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <ImagePlus className="w-8 h-8 mb-3" />
                  <p className="text-sm font-medium">Upload campaign image</p>
                  <p className="text-xs mt-1">Recommended: 1920x1080px</p>
                </div>
              )}
            </label>
          </div>

          {/* Campaign Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <FileText className="w-4 h-4" />
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter campaign title"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Info className="w-4 h-4" />
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your campaign"
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Tags className="w-4 h-4" />
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="" disabled>Select category</option>
                  {CAMPAIGN_CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Target className="w-4 h-4" />
                  Funding Goal (SOL)
                </label>
                <input
                  type="number"
                  value={formData.goal}
                  onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                  placeholder="Enter funding goal"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Calendar className="w-4 h-4" />
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
              style={{ cursor: 'pointer' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors"
              style={{ cursor: 'pointer' }}
            >
              Create Campaign
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default CreateCampaign; 