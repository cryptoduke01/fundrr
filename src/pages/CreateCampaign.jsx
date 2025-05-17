import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Clock, Target, Info, Sparkles, X, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import { useProgram } from '../contexts/ProgramContext';
import { createCampaign } from '../utils/programHelpers';

// Description generation prompts
const DESCRIPTION_TEMPLATES = [
  "Create a compelling crowdfunding campaign about {topic} that aims to {goal}.",
  "Write an engaging description for a campaign focused on {topic} with the purpose of {goal}.",
  "Craft an inspiring story about {topic} explaining why we need {goal}.",
  "Develop a persuasive campaign narrative about {topic} that will motivate people to support {goal}."
];

const CREATIVE_ADJECTIVES = [
  "innovative", "groundbreaking", "transformative", "revolutionary", 
  "inspiring", "game-changing", "visionary", "cutting-edge",
  "impactful", "life-changing", "community-driven", "sustainable"
];

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const program = useProgram();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorPrompt, setGeneratorPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescriptions, setGeneratedDescriptions] = useState([]);
  const textareaRef = useRef(null);
  
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

  const toggleGenerator = () => {
    setShowGenerator(prev => !prev);
    if (!showGenerator) {
      // Extract campaign name as default prompt if available
      setGeneratorPrompt(form.name || '');
    }
  };

  const generateDescriptions = () => {
    if (!generatorPrompt.trim()) {
      toast.error('Please enter a topic for your campaign');
      return;
    }

    setIsGenerating(true);
    
    // Simulating AI generation with creative descriptions
    setTimeout(() => {
      const topic = generatorPrompt.trim();
      const randomAdjective = () => CREATIVE_ADJECTIVES[Math.floor(Math.random() * CREATIVE_ADJECTIVES.length)];
      
      const descriptions = [
        `Our ${randomAdjective()} campaign for ${topic} aims to create a better future by harnessing the power of community support. With your help, we can turn this vision into reality and make a lasting impact on everyone involved. This project isn't just about funding—it's about building a movement that will continue to grow and inspire long after the campaign ends.`,
        
        `Introducing ${topic}: a ${randomAdjective()} initiative designed to solve real problems while creating meaningful opportunities. We've developed this project after extensive research and planning, and now we need your support to bring it to life. Every contribution brings us one step closer to achieving our goal and creating the change we want to see.`,
        
        `The ${topic} project represents a ${randomAdjective()} approach to addressing challenges that affect us all. By supporting this campaign, you're not just funding an idea—you're joining a community of forward-thinking individuals committed to making a difference. Together, we can overcome obstacles and create something truly remarkable.`,
      ];
      
      setGeneratedDescriptions(descriptions);
      setIsGenerating(false);
    }, 1500); // Simulate generation time
  };

  const applyDescription = (description) => {
    setForm(prev => ({ ...prev, description }));
    setShowGenerator(false);
    setGeneratedDescriptions([]);
    
    // Focus back on textarea and show toast
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    toast.success('Description applied!');
  };

  const generateNewBatch = () => {
    setGeneratedDescriptions([]);
    generateDescriptions();
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

            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-300">Description</label>
                <button
                  type="button"
                  onClick={toggleGenerator}
                  className="text-sm flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {showGenerator ? "Hide AI Helper" : "Generate with AI"}
                </button>
              </div>
              <textarea
                ref={textareaRef}
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="Describe your campaign and its purpose"
                rows="4"
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              ></textarea>
              
              <AnimatePresence>
                {showGenerator && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3 p-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-purple-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        AI Description Generator
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowGenerator(false)}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={generatorPrompt}
                          onChange={(e) => setGeneratorPrompt(e.target.value)}
                          placeholder="Enter a topic for your campaign (e.g., 'community garden')"
                          className="flex-1 p-2 text-sm bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                        />
                        <button
                          type="button"
                          onClick={generateDescriptions}
                          disabled={isGenerating}
                          className={`px-3 py-2 rounded-lg text-sm text-white ${
                            isGenerating ? 'bg-gray-600' : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                          } transition-colors flex items-center gap-1.5`}
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Generating...
                            </>
                          ) : 'Generate'}
                        </button>
                      </div>
                      
                      {generatedDescriptions.length > 0 && (
                        <div className="space-y-3 mt-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-300">Generated options:</h4>
                            <button
                              type="button"
                              onClick={generateNewBatch}
                              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Regenerate
                            </button>
                          </div>
                          
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {generatedDescriptions.map((desc, index) => (
                              <div 
                                key={index}
                                className="p-2 bg-gray-700/30 border border-gray-700 rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors"
                                onClick={() => applyDescription(desc)}
                              >
                                <p className="text-xs text-gray-300 line-clamp-3">{desc}</p>
                                <div className="flex justify-end mt-1">
                                  <button
                                    type="button"
                                    className="text-xs text-purple-400 hover:text-purple-300"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      applyDescription(desc);
                                    }}
                                  >
                                    Use this
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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