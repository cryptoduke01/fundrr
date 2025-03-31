use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu");

#[program]
pub mod fundrr {
    use super::*;

    pub fn initialize_campaign(
        ctx: Context<InitializeCampaign>,
        title: String,
        description: String,
        goal_amount: u64,
        deadline: i64,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let creator = &ctx.accounts.creator;

        campaign.creator = creator.key();
        campaign.title = title;
        campaign.description = description;
        campaign.goal_amount = goal_amount;
        campaign.amount_raised = 0;
        campaign.deadline = deadline;
        campaign.is_active = true;

        Ok(())
    }

    pub fn contribute(ctx: Context<Contribute>, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let contributor = &ctx.accounts.contributor;

        require!(campaign.is_active, FundrError::CampaignInactive);
        require!(
            Clock::get()?.unix_timestamp <= campaign.deadline,
            FundrError::CampaignEnded
        );

        // Transfer tokens from contributor to campaign account
        let transfer_instruction = Transfer {
            from: ctx.accounts.contributor_token_account.to_account_info(),
            to: ctx.accounts.campaign_token_account.to_account_info(),
            authority: contributor.to_account_info(),
        };

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                transfer_instruction,
            ),
            amount,
        )?;

        campaign.amount_raised = campaign
            .amount_raised
            .checked_add(amount)
            .ok_or(FundrError::CalculationError)?;

        Ok(())
    }

    pub fn withdraw_funds(ctx: Context<WithdrawFunds>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;

        require!(campaign.is_active, FundrError::CampaignInactive);
        require!(
            campaign.amount_raised >= campaign.goal_amount
                || Clock::get()?.unix_timestamp > campaign.deadline,
            FundrError::WithdrawalNotAllowed
        );

        // Transfer all tokens from campaign account to creator
        let amount = ctx.accounts.campaign_token_account.amount;
        let transfer_instruction = Transfer {
            from: ctx.accounts.campaign_token_account.to_account_info(),
            to: ctx.accounts.creator_token_account.to_account_info(),
            authority: campaign.to_account_info(),
        };

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_instruction,
                &[&[
                    b"campaign",
                    campaign.creator.as_ref(),
                    &[ctx.bumps.campaign],
                ]],
            ),
            amount,
        )?;

        campaign.is_active = false;
        Ok(())
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;

        require!(
            Clock::get()?.unix_timestamp > campaign.deadline
                && campaign.amount_raised < campaign.goal_amount,
            FundrError::RefundNotAllowed
        );

        // Transfer contribution back to contributor
        let amount = ctx.accounts.contribution_account.amount;
        let transfer_instruction = Transfer {
            from: ctx.accounts.campaign_token_account.to_account_info(),
            to: ctx.accounts.contributor_token_account.to_account_info(),
            authority: campaign.to_account_info(),
        };

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_instruction,
                &[&[
                    b"campaign",
                    campaign.creator.as_ref(),
                    &[ctx.bumps.campaign],
                ]],
            ),
            amount,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct InitializeCampaign<'info> {
    #[account(
        init,
        payer = creator,
        space = Campaign::space(&title, &description),
        seeds = [b"campaign", creator.key().as_ref()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
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
    #[account(
        mut,
        has_one = creator,
        seeds = [b"campaign", creator.key().as_ref()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(mut)]
    pub campaign_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub creator_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub contributor: Signer<'info>,
    #[account(mut)]
    pub contribution_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub campaign_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub contributor_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Campaign {
    pub creator: Pubkey,
    pub title: String,
    pub description: String,
    pub goal_amount: u64,
    pub amount_raised: u64,
    pub deadline: i64,
    pub is_active: bool,
}

impl Campaign {
    pub fn space(title: &str, description: &str) -> usize {
        8 + // discriminator
        32 + // creator pubkey
        4 + title.len() + // title string
        4 + description.len() + // description string
        8 + // goal_amount
        8 + // amount_raised
        8 + // deadline
        1 // is_active
    }
}

#[error_code]
pub enum FundrError {
    #[msg("Campaign is not active")]
    CampaignInactive,
    #[msg("Campaign has ended")]
    CampaignEnded,
    #[msg("Withdrawal is not allowed")]
    WithdrawalNotAllowed,
    #[msg("Refund is not allowed")]
    RefundNotAllowed,
    #[msg("Calculation error")]
    CalculationError,
}
