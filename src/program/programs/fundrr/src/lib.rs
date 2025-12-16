use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("7hkr172LN7FM2V8qnrNhCNEJpk8h2RnCBpxhWRx9wuNQ");

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

        // Transfer SOL from contributor to campaign
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: contributor.to_account_info(),
                to: campaign.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        campaign.amount_raised = campaign
            .amount_raised
            .checked_add(amount)
            .ok_or(FundrError::CalculationError)?;

        Ok(())
    }

    pub fn withdraw_funds(ctx: Context<WithdrawFunds>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let creator = &ctx.accounts.creator;

        require!(campaign.is_active, FundrError::CampaignInactive);
        require!(
            campaign.amount_raised >= campaign.goal_amount
                || Clock::get()?.unix_timestamp > campaign.deadline,
            FundrError::WithdrawalNotAllowed
        );

        // Calculate the campaign's current balance
        let rent_exemption = Rent::get()?.minimum_balance(campaign.to_account_info().data_len());
        let campaign_balance = campaign.to_account_info().lamports();
        let withdraw_amount = campaign_balance.saturating_sub(rent_exemption);

        **campaign.to_account_info().try_borrow_mut_lamports()? -= withdraw_amount;
        **creator.to_account_info().try_borrow_mut_lamports()? += withdraw_amount;

        campaign.is_active = false;
        Ok(())
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let contributor = &ctx.accounts.contributor;

        require!(
            Clock::get()?.unix_timestamp > campaign.deadline
                && campaign.amount_raised < campaign.goal_amount,
            FundrError::RefundNotAllowed
        );

        // The refund logic is simplified - in a real scenario you would track contributions
        // This is a placeholder for demonstration purposes
        **campaign.to_account_info().try_borrow_mut_lamports()? -= 0; // Replace with actual contribution amount
        **contributor.to_account_info().try_borrow_mut_lamports()? += 0; // Replace with actual contribution amount

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
    pub system_program: Program<'info, System>,
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
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub contributor: Signer<'info>,
    pub system_program: Program<'info, System>,
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
