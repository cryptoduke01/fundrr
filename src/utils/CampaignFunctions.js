import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import idl from "../idl/fundrr.json";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Program ID from the deployed contract
const PROGRAM_ID = new PublicKey("2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu");

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
    const campaign = anchor.web3.Keypair.generate();

    // Calculate deadline
    const now = new Date();
    const deadline = new Date(now);
    deadline.setDate(now.getDate() + parseInt(campaignData.duration));

    // Create the campaign
    const tx = await program.methods
      .initializeCampaign(
        campaignData.name,
        campaignData.description,
        new anchor.BN(campaignData.goalAmount * LAMPORTS_PER_SOL),
        new anchor.BN(Math.floor(deadline.getTime() / 1000))
      )
      .accounts({
        campaign: campaign.publicKey,
        creator: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([campaign])
      .rpc();

    // Invalidate cache
    campaignsCache = [];
    userCampaignsCache = [];
    lastFetchTimestamp = 0;

    return {
      success: true,
      campaignId: campaign.publicKey.toString(),
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
export const contributeToCampaign = async (wallet, campaignId, amount) => {
  try {
    const program = initializeProgram(wallet);

    // Get campaign public key
    const campaignPubkey = new PublicKey(campaignId);

    // Get contributor's token account
    const contributorTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      wallet.publicKey
    );

    // Get campaign's token account
    const campaignTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      campaignPubkey,
      true
    );

    // Convert SOL to lamports
    const amountLamports = new anchor.BN(amount * LAMPORTS_PER_SOL);

    // Make the contribution
    const tx = await program.methods
      .contribute(amountLamports)
      .accounts({
        campaign: campaignPubkey,
        contributor: wallet.publicKey,
        contributorTokenAccount: contributorTokenAccount,
        campaignTokenAccount: campaignTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
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

    // Get campaign public key
    const campaignPubkey = new PublicKey(campaignId);

    // Get creator's token account
    const creatorTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      wallet.publicKey
    );

    // Get campaign's token account
    const campaignTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      campaignPubkey,
      true
    );

    // Withdraw funds
    const tx = await program.methods
      .withdrawFunds()
      .accounts({
        campaign: campaignPubkey,
        creator: wallet.publicKey,
        campaignTokenAccount: campaignTokenAccount,
        creatorTokenAccount: creatorTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
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
export const fetchCampaign = async (wallet, campaignId) => {
  try {
    const program = initializeProgram(wallet);
    const campaignPubkey = new PublicKey(campaignId);

    // Fetch the campaign account
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
      isCreator: campaignAccount.creator.toString() === wallet.publicKey.toString()
    };
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
        isCreator: account.account.creator.toString() === wallet.publicKey.toString()
      };
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
export const fetchUserCampaigns = async (wallet) => {
  const currentTime = Date.now();

  // Check if we have a valid cache
  if (userCampaignsCache.length > 0 && (currentTime - lastFetchTimestamp < CACHE_TTL)) {
    return userCampaignsCache;
  }

  try {
    const program = initializeProgram(wallet);

    // Fetch campaigns by creator (filter by the creator field)
    const campaignAccounts = await program.account.campaign.all([
      {
        memcmp: {
          offset: 8, // offset for the creator field (after the discriminator)
          bytes: wallet.publicKey.toBase58()
        }
      }
    ]);

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
        isCreator: true // This is always true for user campaigns
      };
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

export default {
  createCampaign,
  contributeToCampaign,
  withdrawFunds,
  cancelCampaign,
  fetchAllCampaigns,
  fetchCampaign,
  fetchUserCampaigns
}; 