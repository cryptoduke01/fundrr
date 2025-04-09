use anchor_lang::prelude::*;
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod fundrr {
    use super::*;

    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        name: String,
        description: String,
        goal_amount: u64,
        duration: i64,
        image_url: String,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let author = &ctx.accounts.author;
        let clock = Clock::get()?;

        // Basic validation
        require!(goal_amount > 0, FundrrError::InvalidGoalAmount);
        require!(duration > 0, FundrrError::InvalidDuration);
        require!(!name.is_empty(), FundrrError::EmptyName);
        require!(!description.is_empty(), FundrrError::EmptyDescription);

        // Initialize campaign data
        campaign.author = author.key();
        campaign.name = name;
        campaign.description = description;
        campaign.goal_amount = goal_amount;
        campaign.raised_amount = 0;
        campaign.image_url = image_url;
        campaign.created_at = clock.unix_timestamp;
        campaign.deadline = clock.unix_timestamp + duration;
        campaign.status = CampaignStatus::Active;
        campaign.contributors_count = 0;
        campaign.bump = *ctx.bumps.get("campaign").unwrap();

        // Update the campaign counter
        let campaign_counter = &mut ctx.accounts.campaign_counter;
        campaign_counter.count = campaign_counter.count.checked_add(1).unwrap();

        emit!(CampaignCreated {
            campaign_id: campaign.key(),
            author: campaign.author,
            name: campaign.name.clone(),
            goal_amount: campaign.goal_amount,
            deadline: campaign.deadline,
        });

        Ok(())
    }

    pub fn contribute(ctx: Context<Contribute>, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let contributor = &ctx.accounts.contributor;
        let clock = Clock::get()?;

        // Validation
        require!(amount > 0, FundrrError::InvalidContributionAmount);
        require!(
            campaign.status == CampaignStatus::Active,
            FundrrError::CampaignNotActive
        );
        require!(
            clock.unix_timestamp <= campaign.deadline,
            FundrrError::CampaignEnded
        );

        // Transfer SOL from contributor to campaign
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            contributor.key,
            &campaign.key(),
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                contributor.to_account_info(),
                ctx.accounts.campaign_account.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Update campaign stats
        campaign.raised_amount = campaign
            .raised_amount
            .checked_add(amount)
            .ok_or(FundrrError::Overflow)?;
        campaign.contributors_count = campaign
            .contributors_count
            .checked_add(1)
            .ok_or(FundrrError::Overflow)?;

        // Check if campaign is now funded
        if campaign.raised_amount >= campaign.goal_amount {
            campaign.status = CampaignStatus::Funded;
        }

        emit!(ContributionMade {
            campaign_id: campaign.key(),
            contributor: contributor.key(),
            amount,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    pub fn withdraw_funds(ctx: Context<WithdrawFunds>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let campaign_account = &ctx.accounts.campaign_account;
        let author = &ctx.accounts.author;
        let clock = Clock::get()?;

        // Validation
        require!(campaign.author == author.key(), FundrrError::Unauthorized);
        require!(
            campaign.status == CampaignStatus::Funded
                || (campaign.status == CampaignStatus::Active
                    && clock.unix_timestamp > campaign.deadline),
            FundrrError::CannotWithdraw
        );

        // Calculate available lamports in the campaign account
        let rent = Rent::get()?;
        let min_rent = rent.minimum_balance(campaign_account.data_len());
        let available_lamports = campaign_account.lamports().saturating_sub(min_rent);

        require!(available_lamports > 0, FundrrError::InsufficientFunds);

        // Transfer available SOL to the author
        **campaign_account.try_borrow_mut_lamports()? = campaign_account
            .lamports()
            .saturating_sub(available_lamports);
        **author.try_borrow_mut_lamports()? = author
            .lamports()
            .checked_add(available_lamports)
            .ok_or(FundrrError::Overflow)?;

        // Update campaign status
        campaign.status = CampaignStatus::Completed;

        emit!(FundsWithdrawn {
            campaign_id: campaign.key(),
            recipient: author.key(),
            amount: available_lamports,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    pub fn cancel_campaign(ctx: Context<CancelCampaign>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let author = &ctx.accounts.author;
        let clock = Clock::get()?;

        // Validation
        require!(campaign.author == author.key(), FundrrError::Unauthorized);
        require!(
            campaign.status == CampaignStatus::Active,
            FundrrError::CannotCancel
        );
        require!(campaign.raised_amount == 0, FundrrError::CannotCancelFunded);

        // Update campaign status
        campaign.status = CampaignStatus::Cancelled;

        emit!(CampaignCancelled {
            campaign_id: campaign.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateCampaign<'info> {
    #[account(
        init,
        payer = author,
        space = Campaign::LEN,
        seeds = [b"campaign", campaign_counter.count.to_le_bytes().as_ref(), author.key().as_ref()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        init_if_needed,
        payer = author,
        space = 8 + 8, // discriminator + u64
        seeds = [b"campaign_counter"],
        bump
    )]
    pub campaign_counter: Account<'info, CampaignCounter>,

    #[account(mut)]
    pub author: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(
        mut,
        seeds = [b"campaign", campaign.id.to_le_bytes().as_ref(), campaign.author.as_ref()],
        bump = campaign.bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    /// CHECK: This is the campaign's address that receives SOL
    pub campaign_account: AccountInfo<'info>,

    #[account(mut)]
    pub contributor: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawFunds<'info> {
    #[account(
        mut,
        seeds = [b"campaign", campaign.id.to_le_bytes().as_ref(), campaign.author.as_ref()],
        bump = campaign.bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    /// CHECK: This is the campaign's address that holds SOL
    pub campaign_account: AccountInfo<'info>,

    #[account(mut)]
    pub author: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelCampaign<'info> {
    #[account(
        mut,
        seeds = [b"campaign", campaign.id.to_le_bytes().as_ref(), campaign.author.as_ref()],
        bump = campaign.bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub author: Signer<'info>,
}

#[account]
pub struct Campaign {
    pub id: u64,                 // Campaign ID
    pub author: Pubkey,          // Creator address
    pub name: String,            // Campaign name
    pub description: String,     // Campaign description
    pub goal_amount: u64,        // Goal amount in lamports
    pub raised_amount: u64,      // Raised amount in lamports
    pub image_url: String,       // Image URL
    pub created_at: i64,         // Creation timestamp
    pub deadline: i64,           // End timestamp
    pub status: CampaignStatus,  // Campaign status
    pub contributors_count: u64, // Number of contributors
    pub bump: u8,                // PDA bump
}

#[account]
pub struct CampaignCounter {
    pub count: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum CampaignStatus {
    Active,    // Campaign is active and accepting donations
    Funded,    // Campaign has reached its goal
    Completed, // Funds have been withdrawn
    Cancelled, // Campaign has been cancelled
}

impl Campaign {
    pub const LEN: usize = 8 +     // discriminator
        8 +                        // id
        32 +                       // author
        4 + 50 +                   // name (max 50 chars)
        4 + 500 +                  // description (max 500 chars)
        8 +                        // goal_amount
        8 +                        // raised_amount
        4 + 200 +                  // image_url (max 200 chars)
        8 +                        // created_at
        8 +                        // deadline
        1 +                        // status
        8 +                        // contributors_count
        1; // bump
}

// Events
#[event]
pub struct CampaignCreated {
    pub campaign_id: Pubkey,
    pub author: Pubkey,
    pub name: String,
    pub goal_amount: u64,
    pub deadline: i64,
}

#[event]
pub struct ContributionMade {
    pub campaign_id: Pubkey,
    pub contributor: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct FundsWithdrawn {
    pub campaign_id: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct CampaignCancelled {
    pub campaign_id: Pubkey,
    pub timestamp: i64,
}

#[error_code]
pub enum FundrrError {
    #[msg("Campaign is not active")]
    CampaignNotActive,

    #[msg("Campaign has ended")]
    CampaignEnded,

    #[msg("Cannot withdraw funds")]
    CannotWithdraw,

    #[msg("Unauthorized access")]
    Unauthorized,

    #[msg("Arithmetic overflow")]
    Overflow,

    #[msg("Invalid goal amount")]
    InvalidGoalAmount,

    #[msg("Invalid duration")]
    InvalidDuration,

    #[msg("Campaign name cannot be empty")]
    EmptyName,

    #[msg("Campaign description cannot be empty")]
    EmptyDescription,

    #[msg("Invalid contribution amount")]
    InvalidContributionAmount,

    #[msg("Insufficient funds")]
    InsufficientFunds,

    #[msg("Cannot cancel campaign")]
    CannotCancel,

    #[msg("Cannot cancel funded campaign")]
    CannotCancelFunded,
}
