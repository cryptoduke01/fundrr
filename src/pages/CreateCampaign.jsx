import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import { useProgram } from '../contexts/ProgramContext';
import { createCampaign } from '../utils/programHelpers';
import { Button } from '../components/ui/button';
import { ArrowLeft, AlertCircle, ExternalLink, CheckCircle } from 'lucide-react';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const program = useProgram();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txSignature, setTxSignature] = useState(null);
  const [createdCampaignId, setCreatedCampaignId] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    goalAmount: '',
    duration: '',
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
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!program) {
      toast.error('Program not initialized. Please refresh and try again.');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading('Creating your campaign...');

      const result = await createCampaign(program, { publicKey }, {
        name: form.name,
        description: form.description,
        goalAmount: parseFloat(form.goalAmount),
        duration: parseInt(form.duration),
      });

      if (result.success) {
        toast.dismiss();
        setTxSignature(result.txSignature);
        setCreatedCampaignId(result.campaignId);
        
        // Show transaction hash in console
        console.log('✅ Campaign created!');
        console.log('Campaign ID:', result.campaignId);
        console.log('Transaction Signature:', result.txSignature);
        console.log('View on Solana Explorer:', `https://explorer.solana.com/tx/${result.txSignature}?cluster=devnet`);
        
        // Don't auto-navigate, let user close modal
        toast.success('Campaign created successfully!', {
          duration: 3000,
        });
      } else {
        toast.dismiss();
        toast.error(`Failed to create campaign: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.dismiss();
      toast.error(error.message || 'An error occurred while creating the campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#000000] dark:via-[#0a0e27] dark:to-[#000000] p-8">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-black dark:text-white mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Wallet Not Connected</h2>
            <p className="text-gray-600 dark:text-white/60 mb-6">Please connect your wallet to create a campaign</p>
            <Button onClick={() => navigate('/')} className="bg-black dark:bg-white text-white dark:text-black rounded-xl">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#000000] dark:via-[#0a0e27] dark:to-[#000000] p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-white/60 hover:text-black dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-5xl font-bold text-black dark:text-white mb-10">
          Create Campaign
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="glass-card rounded-2xl p-10 space-y-8">
            <div>
              <label className="block text-sm font-semibold text-black dark:text-white mb-3 uppercase tracking-wide">
                Campaign Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Enter campaign name"
                className="glass w-full px-5 py-4 rounded-xl text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black dark:text-white mb-3 uppercase tracking-wide">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="Describe your campaign and its purpose"
                rows="6"
                className="glass w-full px-5 py-4 rounded-xl text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-black dark:text-white mb-3 uppercase tracking-wide">
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
                  className="glass w-full px-5 py-4 rounded-xl text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black dark:text-white mb-3 uppercase tracking-wide">
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
                  className="glass w-full px-5 py-4 rounded-xl text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              variant="outline"
              className="rounded-xl border-2 border-black dark:border-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !program}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 rounded-xl px-10 py-6 text-lg font-semibold shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </form>

        {/* Transaction Success Modal */}
        {txSignature && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-2xl p-8 max-w-md w-full space-y-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Campaign Created!
                </h2>
              </div>
              
              <p className="text-gray-600 dark:text-white/60">
                Your campaign has been successfully created on the Solana blockchain.
              </p>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-black dark:text-white">
                  Transaction Hash
                </label>
                <div className="glass rounded-xl p-4 flex items-center gap-3">
                  <code className="flex-1 text-xs text-black dark:text-white break-all font-mono">
                    {txSignature}
                  </code>
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black dark:text-white hover:opacity-70 transition-opacity"
                    title="View on Solana Explorer"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <strong>Note:</strong> Your campaign is now permanently stored on the Solana blockchain. 
                  You can view it anytime using the transaction hash above.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setTxSignature(null);
                    setCreatedCampaignId(null);
                  }}
                  variant="outline"
                  className="flex-1 rounded-xl border-2 border-black dark:border-white"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    if (createdCampaignId) {
                      setTxSignature(null);
                      navigate(`/campaign/${createdCampaignId}`);
                    }
                  }}
                  className="flex-1 bg-black dark:bg-white text-white dark:text-black rounded-xl"
                >
                  View Campaign
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCampaign;
