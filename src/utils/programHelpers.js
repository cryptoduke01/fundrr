import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';

// Program ID from the deployed contract
const PROGRAM_ID = new PublicKey('2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu');

// Helper to find campaign PDA (matches Rust program structure)
const findCampaignPDA = async (creator) => {
  const [campaignPDA, bump] = await PublicKey.findProgramAddress(
    [Buffer.from('campaign'), creator.toBuffer()],
    PROGRAM_ID
  );
  return { campaignPDA, bump };
};

/**
 * Creates a new campaign
 * @param {Object} program - Anchor program instance
 * @param {Object} wallet - Connected wallet with publicKey
 * @param {Object} campaignData - Campaign data (name, description, goalAmount, duration)
 */
export const createCampaign = async (program, wallet, campaignData) => {
  try {
    if (!program || !wallet.publicKey) {
      throw new Error('Program or wallet not available');
    }

    // Calculate deadline
    const now = new Date();
    const deadline = new Date(now);
    deadline.setDate(now.getDate() + parseInt(campaignData.duration));

    // Find campaign PDA
    const { campaignPDA, bump } = await findCampaignPDA(wallet.publicKey);

    // Create campaign using the program interface
    const tx = await program.methods
      .initializeCampaign(
        campaignData.name,
        campaignData.description,
        new anchor.BN(campaignData.goalAmount * LAMPORTS_PER_SOL), // Convert to lamports
        new anchor.BN(Math.floor(deadline.getTime() / 1000)) // Unix timestamp
      )
      .accounts({
        campaign: campaignPDA,
        creator: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    return {
      success: true,
      campaignId: campaignPDA.toString(),
      txSignature: tx,
    };
  } catch (error) {
    console.error('Error creating campaign:', error);
    return {
      success: false,
      error: error.message || 'Failed to create campaign',
    };
  }
};

/**
 * Contribute to a campaign
 * @param {Object} program - Anchor program instance
 * @param {Object} wallet - Connected wallet with publicKey
 * @param {string} campaignId - Campaign PDA (public key)
 * @param {number} amount - Contribution amount in SOL
 */
export const contributeToCampaign = async (program, wallet, campaignId, amount) => {
  try {
    if (!program || !wallet.publicKey) {
      throw new Error('Program or wallet not available');
    }

    const campaignPubkey = new PublicKey(campaignId);
    const amountLamports = new anchor.BN(amount * LAMPORTS_PER_SOL);

    // Make contribution using the program interface
    const tx = await program.methods
      .contribute(amountLamports)
      .accounts({
        campaign: campaignPubkey,
        contributor: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    return {
      success: true,
      txSignature: tx,
    };
  } catch (error) {
    console.error('Error contributing to campaign:', error);
    return {
      success: false,
      error: error.message || 'Failed to contribute',
    };
  }
};

/**
 * Withdraw funds from a campaign
 * @param {Object} program - Anchor program instance
 * @param {Object} wallet - Connected wallet with publicKey
 * @param {string} campaignId - Campaign PDA (public key)
 */
export const withdrawFunds = async (program, wallet, campaignId) => {
  try {
    if (!program || !wallet.publicKey) {
      throw new Error('Program or wallet not available');
    }

    // Find campaign PDA to verify it belongs to the creator
    const { campaignPDA } = await findCampaignPDA(wallet.publicKey);
    
    // Verify the campaign ID matches
    if (campaignPDA.toString() !== campaignId) {
      throw new Error('Campaign does not belong to this creator');
    }

    // Withdraw funds using the program interface
    const tx = await program.methods
      .withdrawFunds()
      .accounts({
        campaign: campaignPDA,
        creator: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    return {
      success: true,
      txSignature: tx,
    };
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    return {
      success: false,
      error: error.message || 'Failed to withdraw funds',
    };
  }
};

/**
 * Fetch a specific campaign
 * @param {Object} program - Anchor program instance
 * @param {string} campaignId - Campaign PDA (public key)
 * @param {PublicKey} walletPublicKey - Connected wallet public key
 */
export const fetchCampaign = async (program, campaignId, walletPublicKey) => {
  try {
    if (!program) {
      throw new Error('Program not available');
    }

    const campaignPubkey = new PublicKey(campaignId);

    // Fetch the campaign account from the blockchain
    const campaignAccount = await program.account.campaign.fetch(campaignPubkey);

    // Format campaign data for UI
    return {
      publicKey: campaignPubkey,
      creator: campaignAccount.creator.toString(),
      title: campaignAccount.title,
      description: campaignAccount.description,
      goalAmount: campaignAccount.goalAmount.toNumber() / LAMPORTS_PER_SOL,
      amountRaised: campaignAccount.amountRaised.toNumber() / LAMPORTS_PER_SOL,
      deadline: new Date(campaignAccount.deadline.toNumber() * 1000),
      isActive: campaignAccount.isActive,
      isCreator: campaignAccount.creator.toString() === walletPublicKey?.toString()
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
    if (!program) {
      return [];
    }

    // Fetch all campaign accounts from the blockchain
    const campaignAccounts = await program.account.campaign.all();

    // Format campaign data for UI
    const campaigns = campaignAccounts.map((account) => {
      return {
        publicKey: account.publicKey,
        creator: account.account.creator.toString(),
        title: account.account.title,
        description: account.account.description,
        goalAmount: account.account.goalAmount.toNumber() / LAMPORTS_PER_SOL,
        amountRaised: account.account.amountRaised.toNumber() / LAMPORTS_PER_SOL,
        deadline: new Date(account.account.deadline.toNumber() * 1000),
        isActive: account.account.isActive,
        isCreator: account.account.creator.toString() === walletPublicKey?.toString()
      };
    });

    return campaigns;
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
    if (!program || !walletPublicKey) {
      return [];
    }

    // Fetch all campaigns and filter by creator
    const allCampaigns = await fetchAllCampaigns(program, walletPublicKey);
    
    return allCampaigns.filter(
      campaign => campaign.creator === walletPublicKey.toString()
    );
  } catch (error) {
    console.error('Error fetching user campaigns:', error);
    return [];
  }
}; 