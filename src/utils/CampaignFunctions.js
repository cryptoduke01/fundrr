import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import idl from "./fundrr_idl.json";

// Program ID from the deployed contract
const PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// RPC URL for connection - Change to mainnet or other networks when ready
const CONNECTION = new Connection('https://api.devnet.solana.com', 'confirmed');

// Cache for campaign data to avoid re-fetching
let campaignsCache = [];
let userCampaignsCache = [];
let lastFetchTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute cache

// Get a connection to the Solana network
const getConnection = () => {
  // Set to devnet for now, can be changed to mainnet later
  const network = "https://api.devnet.solana.com";
  const connection = new anchor.web3.Connection(network, "confirmed");
  return connection;
};

// Get the provider that includes connection and wallet
const getProvider = (wallet) => {
  const connection = getConnection();
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    { preflightCommitment: "confirmed" }
  );
  return provider;
};

// Get the program from the IDL
const getProgram = (wallet) => {
  const provider = getProvider(wallet);
  const program = new anchor.Program(idl, PROGRAM_ID, provider);
  return program;
};

// Helper function to find the campaign counter PDA
const findCampaignCounterPDA = async () => {
  const [counterPDA, _] = await PublicKey.findProgramAddress(
    [Buffer.from("campaign_counter")],
    PROGRAM_ID
  );
  return counterPDA;
};

// Helper function to find a campaign PDA by ID and creator
const findCampaignPDA = async (id, creator) => {
  const [pda, bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from("campaign"),
      Buffer.from(new anchor.BN(id).toArrayLike(Buffer, "le", 8)),
      new PublicKey(creator).toBuffer(),
    ],
    PROGRAM_ID
  );
  return { publicKey: pda, bump };
};

/**
 * Get the campaign PDA for a specific ID
 */
const getCampaignPDA = async (id) => {
  const [campaignPDA] = await PublicKey.findProgramAddress(
    [
      Buffer.from('campaign'),
      new anchor.BN(id).toArrayLike(Buffer, 'le', 8)
    ],
    PROGRAM_ID
  );

  return campaignPDA;
};

/**
 * Get the campaign counter PDA
 */
const getCampaignCounterPDA = async () => {
  const [counterPDA] = await PublicKey.findProgramAddress(
    [Buffer.from('campaign_counter')],
    PROGRAM_ID
  );

  return counterPDA;
};

/**
 * Initialize the Anchor program
 */
const initializeProgram = (wallet) => {
  const provider = new anchor.AnchorProvider(
    CONNECTION,
    wallet,
    { preflightCommitment: 'processed' }
  );

  return new anchor.Program(idl, PROGRAM_ID, provider);
};

/**
 * Create a new campaign
 */
export const createCampaign = async (wallet, campaignData) => {
  try {
    const program = initializeProgram(wallet);
    const counterPDA = await getCampaignCounterPDA();

    // Get the current campaign counter
    let campaignCounter;
    try {
      campaignCounter = await program.account.campaignCounter.fetch(counterPDA);
    } catch (error) {
      // If counter doesn't exist, initialize it
      const tx = await program.methods
        .initializeCampaignCounter()
        .accounts({
          campaignCounter: counterPDA,
          authority: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Now fetch the initialized counter
      campaignCounter = await program.account.campaignCounter.fetch(counterPDA);
    }

    const campaignId = campaignCounter.count;
    const campaignPDA = await getCampaignPDA(campaignId);

    // Convert the goal amount from SOL to lamports
    const goalAmountLamports = new anchor.BN(
      campaignData.goalAmount * LAMPORTS_PER_SOL
    );

    // Calculate deadline
    const now = new Date();
    const deadline = new Date(now);
    deadline.setDate(now.getDate() + parseInt(campaignData.duration));

    // Create the campaign
    const tx = await program.methods
      .createCampaign(
        campaignData.name,
        campaignData.description,
        goalAmountLamports,
        new anchor.BN(deadline.getTime()),
        campaignData.imageUrl
      )
      .accounts({
        campaign: campaignPDA,
        campaignCounter: counterPDA,
        author: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Invalidate cache
    campaignsCache = [];
    userCampaignsCache = [];
    lastFetchTimestamp = 0;

    return {
      success: true,
      campaignId: campaignId.toString(),
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
 */
export const contributeToCampaign = async (wallet, campaignId, authorPublicKey, amount) => {
  try {
    const program = initializeProgram(wallet);
    const campaignPDA = await getCampaignPDA(campaignId);

    // Convert SOL to lamports
    const amountLamports = new anchor.BN(amount * LAMPORTS_PER_SOL);

    // Make the contribution
    const tx = await program.methods
      .contribute(amountLamports)
      .accounts({
        campaign: campaignPDA,
        campaignAccount: new PublicKey(authorPublicKey),
        contributor: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Invalidate cache
    campaignsCache = [];
    userCampaignsCache = [];
    lastFetchTimestamp = 0;

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
 */
export const withdrawFunds = async (wallet, campaignId) => {
  try {
    const program = initializeProgram(wallet);
    const campaignPDA = await getCampaignPDA(campaignId);

    // Withdraw funds
    const tx = await program.methods
      .withdrawFunds()
      .accounts({
        campaign: campaignPDA,
        campaignAccount: wallet.publicKey,
        author: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Invalidate cache
    campaignsCache = [];
    userCampaignsCache = [];
    lastFetchTimestamp = 0;

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
 * Cancel a campaign
 */
export const cancelCampaign = async (wallet, campaignId) => {
  try {
    const program = initializeProgram(wallet);
    const campaignPDA = await getCampaignPDA(campaignId);

    // Cancel the campaign
    const tx = await program.methods
      .cancelCampaign()
      .accounts({
        campaign: campaignPDA,
        author: wallet.publicKey,
      })
      .rpc();

    // Invalidate cache
    campaignsCache = [];
    userCampaignsCache = [];
    lastFetchTimestamp = 0;

    return {
      success: true,
      txSignature: tx,
    };
  } catch (error) {
    console.error('Error cancelling campaign:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Fetch a specific campaign
 */
export const fetchCampaign = async (wallet, campaignId, authorPublicKey) => {
  try {
    const program = initializeProgram(wallet);
    const campaignPDA = await getCampaignPDA(campaignId);

    // Fetch the campaign account
    const campaignAccount = await program.account.campaign.fetch(campaignPDA);

    // Format campaign data for UI
    return formatCampaignData(campaignAccount, campaignId, wallet.publicKey.toString());
  } catch (error) {
    console.error('Error fetching campaign:', error);
    throw error;
  }
};

/**
 * Fetch all campaigns
 */
export const fetchAllCampaigns = async (wallet) => {
  const currentTime = Date.now();

  // Check if we have a valid cache
  if (campaignsCache.length > 0 && (currentTime - lastFetchTimestamp < CACHE_TTL)) {
    return campaignsCache;
  }

  try {
    const program = initializeProgram(wallet);

    // Fetch all campaign accounts
    const campaignAccounts = await program.account.campaign.all();

    // Format campaign data for UI
    const campaigns = campaignAccounts.map((account, index) => {
      return formatCampaignData(account.account, index, wallet.publicKey.toString());
    });

    // Update cache
    campaignsCache = campaigns;
    lastFetchTimestamp = currentTime;

    return campaigns;
  } catch (error) {
    console.error('Error fetching all campaigns:', error);
    return [];
  }
};

/**
 * Fetch campaigns created by the user
 */
export const fetchUserCampaigns = async (wallet, userPublicKey) => {
  const currentTime = Date.now();

  // Check if we have a valid cache
  if (userCampaignsCache.length > 0 && (currentTime - lastFetchTimestamp < CACHE_TTL)) {
    return userCampaignsCache;
  }

  try {
    const program = initializeProgram(wallet);

    // Fetch campaigns by author
    const campaignAccounts = await program.account.campaign.all([
      {
        memcmp: {
          offset: 8, // offset for the author field
          bytes: userPublicKey
        }
      }
    ]);

    // Format campaign data for UI
    const campaigns = campaignAccounts.map((account, index) => {
      return formatCampaignData(account.account, index, userPublicKey);
    });

    // Update cache
    userCampaignsCache = campaigns;
    lastFetchTimestamp = currentTime;

    return campaigns;
  } catch (error) {
    console.error('Error fetching user campaigns:', error);
    return [];
  }
};

/**
 * Format raw campaign data for UI
 */
const formatCampaignData = (campaignAccount, id, userPublicKey) => {
  // Convert lamports to SOL
  const goalAmount = campaignAccount.goalAmount.toNumber() / LAMPORTS_PER_SOL;
  const raisedAmount = campaignAccount.raisedAmount.toNumber() / LAMPORTS_PER_SOL;

  // Map status number to string
  const statusMap = ['active', 'funded', 'completed', 'cancelled'];
  const status = statusMap[campaignAccount.status];

  return {
    id,
    name: campaignAccount.name,
    description: campaignAccount.description,
    author: campaignAccount.author.toString(),
    isAuthor: campaignAccount.author.toString() === userPublicKey,
    goalAmount,
    raisedAmount,
    contributorsCount: campaignAccount.contributorsCount,
    createdAt: new Date(campaignAccount.createdAt.toNumber()),
    deadline: new Date(campaignAccount.deadline.toNumber()),
    status,
    imageUrl: campaignAccount.imageUrl,
  };
};

export default {
  createCampaign,
  contributeToCampaign,
  withdrawFunds,
  cancelCampaign,
  fetchAllCampaigns,
  fetchCampaign,
  fetchUserCampaigns
}; 