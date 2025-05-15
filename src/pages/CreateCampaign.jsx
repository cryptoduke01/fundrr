import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Clock, Target, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import { useProgram } from '../contexts/ProgramContext';
import { createCampaign } from '../utils/programHelpers';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const program = useProgram();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    goalAmount: '',
    duration: '',
    imageUrl: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Campaign name is required';
    if (!form.description.trim()) return 'Description is required';
    if (!form.goalAmount || isNaN(form.goalAmount) || parseFloat(form.goalAmount) <= 0)
      return 'Goal amount must be a positive number';
    if (!form.duration || isNaN(form.duration) || parseInt(form.duration) <= 0)
      return 'Duration must be a positive number of days';
    if (!form.imageUrl.trim()) return 'Image URL is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading('Creating your campaign...');

      // Call the createCampaign function from our utils
      const result = await createCampaign(program, { publicKey }, {
        name: form.name,
        description: form.description,
        goalAmount: parseFloat(form.goalAmount),
        duration: parseInt(form.duration),
        imageUrl: form.imageUrl,
      });

      if (result.success) {
        toast.dismiss();
        toast.success('Campaign created successfully!');
        navigate(`/campaign/${result.campaignId}`);
      } else {
        toast.dismiss();
        toast.error(`Failed to create campaign: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.dismiss();
      toast.error('An error occurred while creating the campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 mb-8">
        Create a New Campaign
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
              <Info className="w-5 h-5 text-purple-500" />
            </div>
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
              Basic Information
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Campaign Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Enter the name of your campaign"
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="Describe your campaign and its purpose"
                rows="4"
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              ></textarea>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
              Funding Goals
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">
                Goal Amount (SOL)
              </label>
              <input
                type="number"
                name="goalAmount"
                step="0.01"
                min="0.1"
                value={form.goalAmount}
                onChange={handleInputChange}
                placeholder="e.g. 10.5"
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Duration (days)
              </label>
              <input
                type="number"
                name="duration"
                min="1"
                max="365"
                value={form.duration}
                onChange={handleInputChange}
                placeholder="e.g. 30"
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
              <Image className="w-5 h-5 text-purple-500" />
            </div>
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
              Campaign Image
            </h2>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Image URL</label>
            <input
              type="url"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleInputChange}
              placeholder="Enter a URL for your campaign image"
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
            />
            {form.imageUrl && (
              <div className="mt-4">
                <p className="text-gray-400 mb-2">Preview:</p>
                <img
                  src={form.imageUrl}
                  alt="Campaign preview"
                  className="max-h-48 rounded-xl object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-xl text-white ${isSubmitting
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
              } transition-colors`}
            whileHover={!isSubmitting ? { scale: 1.03 } : {}}
            whileTap={!isSubmitting ? { scale: 0.97 } : {}}
          >
            {isSubmitting ? 'Creating...' : 'Create Campaign'}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign; 