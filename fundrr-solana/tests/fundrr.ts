import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Fundrr } from "../target/types/fundrr";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
} from "@solana/spl-token";

describe("fundrr", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Fundrr as Program<Fundrr>;

  let mint: PublicKey;
  let campaignTokenAccount: PublicKey;
  let authorTokenAccount: PublicKey;
  let contributorTokenAccount: PublicKey;

  before(async () => {
    // Create a new token mint
    mint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      9 // 9 decimals
    );

    // Create token accounts
    campaignTokenAccount = await createAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      provider.wallet.publicKey
    );

    authorTokenAccount = await createAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      provider.wallet.publicKey
    );

    contributorTokenAccount = await createAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      provider.wallet.publicKey
    );

    // Mint some tokens to the contributor
    await mintTo(
      provider.connection,
      provider.wallet.payer,
      mint,
      contributorTokenAccount,
      provider.wallet.publicKey,
      1000000000 // 1000 tokens
    );
  });

  it("Creates a campaign", async () => {
    const campaign = anchor.web3.Keypair.generate();
    const goalAmount = new anchor.BN(100000000); // 100 tokens
    const duration = new anchor.BN(86400); // 1 day
    const metadataUrl = "https://ipfs.io/ipfs/test";

    await program.methods
      .createCampaign(goalAmount, duration, metadataUrl)
      .accounts({
        campaign: campaign.publicKey,
        author: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([campaign])
      .rpc();

    const campaignAccount = await program.account.campaign.fetch(
      campaign.publicKey
    );
    assert.equal(
      campaignAccount.author.toBase58(),
      provider.wallet.publicKey.toBase58()
    );
    assert.equal(campaignAccount.goalAmount.toNumber(), goalAmount.toNumber());
    assert.equal(campaignAccount.raisedAmount.toNumber(), 0);
    assert.equal(campaignAccount.metadataUrl, metadataUrl);
  });

  it("Contributes to a campaign", async () => {
    const campaign = anchor.web3.Keypair.generate();
    const goalAmount = new anchor.BN(100000000);
    const duration = new anchor.BN(86400);
    const metadataUrl = "https://ipfs.io/ipfs/test";
    const contributionAmount = new anchor.BN(50000000); // 50 tokens

    // Create campaign first
    await program.methods
      .createCampaign(goalAmount, duration, metadataUrl)
      .accounts({
        campaign: campaign.publicKey,
        author: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([campaign])
      .rpc();

    // Contribute to campaign
    await program.methods
      .contribute(contributionAmount)
      .accounts({
        campaign: campaign.publicKey,
        contributor: provider.wallet.publicKey,
        contributorTokenAccount: contributorTokenAccount,
        campaignTokenAccount: campaignTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const campaignAccount = await program.account.campaign.fetch(
      campaign.publicKey
    );
    assert.equal(
      campaignAccount.raisedAmount.toNumber(),
      contributionAmount.toNumber()
    );
  });

  it("Withdraws funds from a funded campaign", async () => {
    const campaign = anchor.web3.Keypair.generate();
    const goalAmount = new anchor.BN(100000000);
    const duration = new anchor.BN(86400);
    const metadataUrl = "https://ipfs.io/ipfs/test";
    const contributionAmount = new anchor.BN(100000000); // 100 tokens

    // Create campaign
    await program.methods
      .createCampaign(goalAmount, duration, metadataUrl)
      .accounts({
        campaign: campaign.publicKey,
        author: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([campaign])
      .rpc();

    // Contribute full amount
    await program.methods
      .contribute(contributionAmount)
      .accounts({
        campaign: campaign.publicKey,
        contributor: provider.wallet.publicKey,
        contributorTokenAccount: contributorTokenAccount,
        campaignTokenAccount: campaignTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    // Fast forward time (in local validator)
    await provider.connection.requestAirdrop(
      provider.wallet.publicKey,
      1000000000
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Withdraw funds
    await program.methods
      .withdrawFunds()
      .accounts({
        campaign: campaign.publicKey,
        author: provider.wallet.publicKey,
        campaignTokenAccount: campaignTokenAccount,
        authorTokenAccount: authorTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const campaignAccount = await program.account.campaign.fetch(
      campaign.publicKey
    );
    assert.equal(campaignAccount.status, { completed: {} });
  });
});
