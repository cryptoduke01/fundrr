import { PublicKey, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';

// DEMO MODE: Mock campaign data cache for the demo
const DEMO_CAMPAIGNS = new Map();
// Transaction history for the connected wallet
const TRANSACTION_HISTORY = new Map();
let CAMPAIGN_COUNTER = 0;

// Helper to add a transaction to history
const recordTransaction = (walletAddress, type, data, signature) => {
  if (!walletAddress) return;

  const walletKey = walletAddress.toString();
  const walletHistory = TRANSACTION_HISTORY.get(walletKey) || [];

  walletHistory.push({
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    data,
    signature,
    timestamp: new Date(),
  });

  // Limit history size
  if (walletHistory.length > 50) {
    walletHistory.shift();
  }

  TRANSACTION_HISTORY.set(walletKey, walletHistory);
};

// Helper to get transaction history for a wallet
export const getTransactionHistory = (walletAddress) => {
  if (!walletAddress) return [];

  const walletKey = walletAddress.toString();
  return TRANSACTION_HISTORY.get(walletKey) || [];
};

// Demo helper to generate a unique ID
const generateDemoId = () => {
  // Generate a real Solana keypair to ensure it's a valid base58 string
  const keypair = Keypair.generate();
  return keypair.publicKey.toString();
};

// Demo helper to create a campaign object
const createDemoCampaign = (wallet, campaignData, deadline) => {
  const campaignId = generateDemoId();
  const campaign = {
    publicKey: new PublicKey(campaignId),
    creator: wallet.publicKey.toString(),
    title: campaignData.name,
    description: campaignData.description,
    goalAmount: campaignData.goalAmount,
    amountRaised: 0,
    deadline: deadline,
    isActive: true,
    isCreator: true,
    contributions: [],
    imageUrl: campaignData.imageUrl
  };
  DEMO_CAMPAIGNS.set(campaignId, campaign);
  return { campaignId, campaign };
};

/**
 * Creates a new campaign
 * @param {Object} program - Anchor program instance
 * @param {Object} wallet - Connected wallet
 * @param {Object} campaignData - Campaign data (title, description, etc.)
 */
export const createCampaign = async (program, wallet, campaignData) => {
  try {
    // Calculate deadline
    const now = new Date();
    const deadline = new Date(now);
    deadline.setDate(now.getDate() + parseInt(campaignData.duration));

    // Create campaign using the program interface
    const tx = await program.methods
      .initializeCampaign(
        campaignData.name,
        campaignData.description,
        new anchor.BN(campaignData.goalAmount * LAMPORTS_PER_SOL), // Convert to lamports
        new anchor.BN(Math.floor(deadline.getTime() / 1000)) // Unix timestamp
      )
      .rpc();

    // DEMO MODE: Create campaign in local storage for demo
    const { campaignId, campaign } = createDemoCampaign(wallet, campaignData, deadline);

    // Record transaction in history
    recordTransaction(wallet.publicKey, 'campaign_created', {
      campaignId,
      name: campaignData.name,
      goalAmount: campaignData.goalAmount,
      fee: 0.01
    }, tx);

    // Increment counter for UI refresh
    CAMPAIGN_COUNTER++;

    return {
      success: true,
      campaignId: campaignId,
      txSignature: tx,
    };
  } catch (error) {
    console.error('Error creating campaign:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Contribute to a campaign
 * @param {Object} program - Anchor program instance
 * @param {Object} wallet - Connected wallet
 * @param {string} campaignId - Campaign ID (public key)
 * @param {number} amount - Contribution amount
 */
export const contributeToCampaign = async (program, wallet, campaignId, amount) => {
  try {
    // Make contribution using the program interface
    const tx = await program.methods
      .contribute(new anchor.BN(amount * LAMPORTS_PER_SOL))
      .rpc();

    // DEMO MODE: Update campaign in local storage for demo
    if (DEMO_CAMPAIGNS.has(campaignId)) {
      const campaign = DEMO_CAMPAIGNS.get(campaignId);
      campaign.amountRaised += parseFloat(amount);
      campaign.contributions.push({
        contributor: wallet.publicKey.toString(),
        amount: parseFloat(amount),
        timestamp: new Date()
      });
      DEMO_CAMPAIGNS.set(campaignId, campaign);

      // Record transaction in history
      recordTransaction(wallet.publicKey, 'contribution', {
        campaignId,
        campaignName: campaign.title,
        amount: parseFloat(amount),
        fee: Math.min(parseFloat(amount), 0.05)
      }, tx);
    }

    return {
      success: true,
      txSignature: tx,
    };
  } catch (error) {
    console.error('Error contributing to campaign:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Withdraw funds from a campaign
 * @param {Object} program - Anchor program instance
 * @param {Object} wallet - Connected wallet
 * @param {string} campaignId - Campaign ID (public key)
 */
export const withdrawFunds = async (program, wallet, campaignId) => {
  try {
    // Withdraw funds using the program interface
    const tx = await program.methods
      .withdrawFunds()
      .rpc();

    // DEMO MODE: Update campaign in local storage for demo
    if (DEMO_CAMPAIGNS.has(campaignId)) {
      const campaign = DEMO_CAMPAIGNS.get(campaignId);
      campaign.isActive = false;
      DEMO_CAMPAIGNS.set(campaignId, campaign);

      // Record transaction in history
      recordTransaction(wallet.publicKey, 'withdrawal', {
        campaignId,
        campaignName: campaign.title,
        amountRaised: campaign.amountRaised,
        fee: 0.005
      }, tx);
    }

    return {
      success: true,
      txSignature: tx,
    };
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Fetch a specific campaign
 * @param {Object} program - Anchor program instance
 * @param {string} campaignId - Campaign ID (public key)
 * @param {PublicKey} walletPublicKey - Connected wallet public key
 */
export const fetchCampaign = async (program, campaignId, walletPublicKey) => {
  try {
    // DEMO MODE: Return from local storage if available
    if (DEMO_CAMPAIGNS.has(campaignId)) {
      const campaign = DEMO_CAMPAIGNS.get(campaignId);
      return {
        ...campaign,
        isCreator: campaign.creator === walletPublicKey.toString()
      };
    }

    // Create a dummy campaign if not found
    return {
      publicKey: new PublicKey(campaignId),
      creator: walletPublicKey.toString(),
      title: "Demo Campaign",
      description: "This is a demo campaign for testing purposes.",
      goalAmount: 10,
      amountRaised: 2,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      isCreator: true
    };
  } catch (error) {
    console.error('Error fetching campaign:', error);
    throw error;
  }
};

/**
 * Fetch all campaigns
 * @param {Object} program - Anchor program instance
 * @param {PublicKey} walletPublicKey - Connected wallet public key
 */
export const fetchAllCampaigns = async (program, walletPublicKey) => {
  try {
    // DEMO MODE: Return from local storage for demo
    const campaigns = Array.from(DEMO_CAMPAIGNS.values());

    // If no campaigns yet, create sample campaigns
    if (campaigns.length === 0) {
      const sampleCampaigns = [
        {
          name: "Educational Support Fund",
          description: "Help fund educational resources for underprivileged schools.",
          goalAmount: 15,
          duration: "30"
        },
        {
          name: "Community Garden Project",
          description: "Support our local community garden initiative.",
          goalAmount: 5,
          duration: "14"
        },
        {
          name: "Tech Startup Accelerator",
          description: "Fund the next generation of tech entrepreneurs.",
          goalAmount: 25,
          duration: "60"
        }
      ];

      // Create demo campaigns
      for (const campaignData of sampleCampaigns) {
        const now = new Date();
        const deadline = new Date(now);
        deadline.setDate(now.getDate() + parseInt(campaignData.duration));

        // Create a valid demo creator wallet
        const demoCreator = { publicKey: Keypair.generate().publicKey };

        const { campaignId, campaign } = createDemoCampaign(
          demoCreator,
          campaignData,
          deadline
        );

        // Add some random progress
        campaign.amountRaised = Math.random() * (campaignData.goalAmount * 0.75);
      }
    }

    // Get updated campaigns
    const updatedCampaigns = Array.from(DEMO_CAMPAIGNS.values());

    // Format for UI with isCreator flag
    return updatedCampaigns.map(campaign => ({
      ...campaign,
      isCreator: campaign.creator === walletPublicKey?.toString()
    }));
  } catch (error) {
    console.error('Error fetching all campaigns:', error);
    return [];
  }
};

/**
 * Fetch campaigns created by the user
 * @param {Object} program - Anchor program instance
 * @param {PublicKey} walletPublicKey - Connected wallet public key
 */
export const fetchUserCampaigns = async (program, walletPublicKey) => {
  try {
    // DEMO MODE: Filter campaigns created by current user
    const allCampaigns = Array.from(DEMO_CAMPAIGNS.values());
    return allCampaigns.filter(
      campaign => campaign.creator === walletPublicKey.toString()
    );
  } catch (error) {
    console.error('Error fetching user campaigns:', error);
    return [];
  }
}; 