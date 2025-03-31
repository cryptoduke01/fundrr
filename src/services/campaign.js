import { web3, BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

// USDC token mint address on devnet
const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

export class CampaignService {
  constructor(program, wallet) {
    this.program = program;
    this.wallet = wallet;
  }

  async createCampaign(title, metadataUrl, goalAmount, duration, currency, category) {
    const campaign = web3.Keypair.generate();
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + duration);

    try {
      if (currency === 'USDC') {
        // Get campaign token account
        const campaignTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          campaign.publicKey,
          true // allowOwnerOffCurve
        );

        await this.program.methods
          .initializeCampaign(
            title,
            metadataUrl, // Store IPFS URL in description
            new BN(goalAmount * 1e6), // Convert to USDC decimals
            new BN(Math.floor(deadline.getTime() / 1000)), // Unix timestamp
            category,
            true // isUsdc
          )
          .accounts({
            campaign: campaign.publicKey,
            creator: this.wallet,
            mint: USDC_MINT,
            campaignTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([campaign])
          .rpc();
      } else {
        await this.program.methods
          .initializeCampaign(
            title,
            metadataUrl, // Store IPFS URL in description
            new BN(goalAmount * web3.LAMPORTS_PER_SOL), // Convert to lamports
            new BN(Math.floor(deadline.getTime() / 1000)), // Unix timestamp
            category,
            false // isUsdc
          )
          .accounts({
            campaign: campaign.publicKey,
            creator: this.wallet,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([campaign])
          .rpc();
      }

      return campaign.publicKey;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  async fetchMetadata(metadataUrl) {
    try {
      const response = await fetch(metadataUrl);
      const metadata = await response.json();
      return metadata;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  }

  async contribute(campaignPubkey, amount, currency) {
    try {
      if (currency === 'USDC') {
        // Get contributor's token account
        const contributorTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          this.wallet
        );

        // Get campaign's token account
        const campaignTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          campaignPubkey,
          true
        );

        await this.program.methods
          .contribute(new BN(amount * 1e6)) // Convert to USDC decimals
          .accounts({
            campaign: campaignPubkey,
            contributor: this.wallet,
            contributorTokenAccount,
            campaignTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
      } else {
        await this.program.methods
          .contribute(new BN(amount * web3.LAMPORTS_PER_SOL)) // Convert to lamports
          .accounts({
            campaign: campaignPubkey,
            contributor: this.wallet,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();
      }
    } catch (error) {
      console.error('Error contributing to campaign:', error);
      throw error;
    }
  }

  async withdrawFunds(campaignPubkey, currency) {
    try {
      if (currency === 'USDC') {
        // Get creator's token account
        const creatorTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          this.wallet
        );

        // Get campaign's token account
        const campaignTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          campaignPubkey,
          true
        );

        await this.program.methods
          .withdrawFunds()
          .accounts({
            campaign: campaignPubkey,
            creator: this.wallet,
            creatorTokenAccount,
            campaignTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
      } else {
        await this.program.methods
          .withdrawFunds()
          .accounts({
            campaign: campaignPubkey,
            creator: this.wallet,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();
      }
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      throw error;
    }
  }

  async getCampaign(pubkey) {
    try {
      const campaign = await this.program.account.campaign.fetch(pubkey);
      const isUsdc = campaign.isUsdc;
      const divisor = isUsdc ? 1e6 : web3.LAMPORTS_PER_SOL;

      // Fetch metadata from IPFS
      const metadata = await this.fetchMetadata(campaign.description);

      return {
        publicKey: pubkey,
        creator: campaign.creator,
        title: campaign.title,
        description: metadata ? metadata.description : campaign.description,
        imageUrl: metadata ? metadata.imageUrl : null,
        goalAmount: campaign.goalAmount.toNumber() / divisor,
        amountRaised: campaign.amountRaised.toNumber() / divisor,
        deadline: new Date(campaign.deadline.toNumber() * 1000),
        isActive: campaign.isActive,
        currency: isUsdc ? 'USDC' : 'SOL',
        category: campaign.category
      };
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  }

  async getAllCampaigns() {
    try {
      const campaigns = await this.program.account.campaign.all();
      return Promise.all(campaigns.map(async ({ publicKey, account }) => {
        const isUsdc = account.isUsdc;
        const divisor = isUsdc ? 1e6 : web3.LAMPORTS_PER_SOL;

        // Fetch metadata from IPFS
        const metadata = await this.fetchMetadata(account.description);

        return {
          publicKey,
          creator: account.creator,
          title: account.title,
          description: metadata ? metadata.description : account.description,
          imageUrl: metadata ? metadata.imageUrl : null,
          goalAmount: account.goalAmount.toNumber() / divisor,
          amountRaised: account.amountRaised.toNumber() / divisor,
          deadline: new Date(account.deadline.toNumber() * 1000),
          isActive: account.isActive,
          currency: isUsdc ? 'USDC' : 'SOL',
          category: account.category
        };
      }));
    } catch (error) {
      console.error('Error fetching all campaigns:', error);
      throw error;
    }
  }

  async getMyCampaigns() {
    try {
      const campaigns = await this.program.account.campaign.all([
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: this.wallet.toBase58(),
          },
        },
      ]);
      return Promise.all(campaigns.map(async ({ publicKey, account }) => {
        const isUsdc = account.isUsdc;
        const divisor = isUsdc ? 1e6 : web3.LAMPORTS_PER_SOL;

        // Fetch metadata from IPFS
        const metadata = await this.fetchMetadata(account.description);

        return {
          publicKey,
          creator: account.creator,
          title: account.title,
          description: metadata ? metadata.description : account.description,
          imageUrl: metadata ? metadata.imageUrl : null,
          goalAmount: account.goalAmount.toNumber() / divisor,
          amountRaised: account.amountRaised.toNumber() / divisor,
          deadline: new Date(account.deadline.toNumber() * 1000),
          isActive: account.isActive,
          currency: isUsdc ? 'USDC' : 'SOL',
          category: account.category
        };
      }));
    } catch (error) {
      console.error('Error fetching user campaigns:', error);
      throw error;
    }
  }
} 