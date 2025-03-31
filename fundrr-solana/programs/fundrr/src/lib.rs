use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("FUNDRR_PROGRAM_ID");

#[program]
pub mod fundrr {
    use super::*;

    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        goal_amount: u64,
        duration: i64,
        metadata_url: String,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let clock = Clock::get()?;

        campaign.author = ctx.accounts.author.key();
        campaign.goal_amount = goal_amount;
        campaign.raised_amount = 0;
        campaign.metadata_url = metadata_url;
        campaign.created_at = clock.unix_timestamp;
        campaign.deadline = clock.unix_timestamp + duration;
        campaign.status = CampaignStatus::Active;

        Ok(())
    }

    pub fn contribute(ctx: Context<Contribute>, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let clock = Clock::get()?;

        require!(
            campaign.status == CampaignStatus::Active,
            FundrrError::CampaignNotActive
        );
        require!(
            clock.unix_timestamp <= campaign.deadline,
            FundrrError::CampaignEnded
        );

        // Transfer tokens from contributor to campaign
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.contributor_token_account.to_account_info(),
                to: ctx.accounts.campaign_token_account.to_account_info(),
                authority: ctx.accounts.contributor.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
            },
        );

        token::transfer(transfer_ctx, amount)?;

        campaign.raised_amount = campaign
            .raised_amount
            .checked_add(amount)
            .ok_or(FundrrError::Overflow)?;

        if campaign.raised_amount >= campaign.goal_amount {
            campaign.status = CampaignStatus::Funded;
        }

        Ok(())
    }

    pub fn withdraw_funds(ctx: Context<WithdrawFunds>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let clock = Clock::get()?;

        require!(
            campaign.author == ctx.accounts.author.key(),
            FundrrError::Unauthorized
        );
        require!(
            campaign.status == CampaignStatus::Funded,
            FundrrError::CampaignNotFunded
        );
        require!(
            clock.unix_timestamp > campaign.deadline,
            FundrrError::CampaignNotEnded
        );

        // Transfer funds to author
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.campaign_token_account.to_account_info(),
                to: ctx.accounts.author_token_account.to_account_info(),
                authority: ctx.accounts.campaign.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
            },
        );

        token::transfer(transfer_ctx, campaign.raised_amount)?;
        campaign.status = CampaignStatus::Completed;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateCampaign<'info> {
    #[account(
        init,
        payer = author,
        space = Campaign::LEN,
        seeds = [b"campaign", author.key().as_ref()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub author: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub contributor: Signer<'info>,

    #[account(mut)]
    pub contributor_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub campaign_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawFunds<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,

    pub author: Signer<'info>,

    #[account(mut)]
    pub campaign_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub author_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Campaign {
    pub author: Pubkey,
    pub goal_amount: u64,
    pub raised_amount: u64,
    pub metadata_url: String,
    pub created_at: i64,
    pub deadline: i64,
    pub status: CampaignStatus,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum CampaignStatus {
    Active,
    Funded,
    Completed,
}

impl Campaign {
    pub const LEN: usize = 8 + // discriminator
        32 + // author
        8 + // goal_amount
        8 + // raised_amount
        4 + 200 + // metadata_url (max 200 chars)
        8 + // created_at
        8 + // deadline
        1; // status
}

#[error_code]
pub enum FundrrError {
    #[msg("Campaign is not active")]
    CampaignNotActive,

    #[msg("Campaign has ended")]
    CampaignEnded,

    #[msg("Campaign is not funded")]
    CampaignNotFunded,

    #[msg("Campaign has not ended yet")]
    CampaignNotEnded,

    #[msg("Unauthorized")]
    Unauthorized,

    #[msg("Arithmetic overflow")]
    Overflow,
}
