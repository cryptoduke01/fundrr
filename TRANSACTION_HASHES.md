# Transaction Hashes & Blockchain Permanence

## ✅ Yes, Campaigns Are Permanent!

When you create a campaign on the Solana blockchain, it's **permanently stored**:

- **On Devnet**: Campaigns persist until devnet is reset (rare, but can happen)
- **On Mainnet**: Campaigns are **permanent forever** - they cannot be deleted or modified

## How to Check Transaction Hashes

### Method 1: In the App (After Creating Campaign)
After successfully creating a campaign, you'll see a **success modal** with:
- ✅ Transaction hash displayed
- 🔗 Link to view on Solana Explorer
- Campaign ID

### Method 2: Browser Console
Open your browser's developer console (F12 or Cmd+Option+I) and look for:
```
✅ Campaign created!
Campaign ID: <campaign-address>
Transaction Signature: <transaction-hash>
View on Solana Explorer: https://explorer.solana.com/tx/<hash>?cluster=devnet
```

### Method 3: Solana Explorer
1. Go to https://explorer.solana.com/?cluster=devnet
2. Paste your transaction hash in the search bar
3. View full transaction details

### Method 4: Check Your Wallet
1. Open your Solana wallet (Phantom, Solflare, etc.)
2. Go to "Activity" or "Transactions"
3. Find your campaign creation transaction
4. Click to view details and transaction hash

## Transaction Hash Format

Transaction hashes look like this:
```
yiFH24xcR6Nu9Nw3Xt7tyJeDe5DvWehST7isoUCDNRhZGHrNd4MkYad9Jcoo1whTi1Rp9DTqURVovNDhsDEjNp7
```

They are:
- **Base58 encoded** strings
- **88 characters** long
- **Unique identifiers** for each transaction

## What You Can Do With Transaction Hashes

1. **Verify Campaign Creation**: Check that your campaign was successfully created
2. **View Transaction Details**: See fees, accounts involved, program logs
3. **Share Proof**: Share the hash to prove your campaign exists
4. **Debug Issues**: Use the hash to troubleshoot if something goes wrong

## Example Transaction Explorer URL

```
https://explorer.solana.com/tx/YOUR_TRANSACTION_HASH?cluster=devnet
```

Replace `YOUR_TRANSACTION_HASH` with your actual transaction hash.

## All Transaction Types

Your app creates transactions for:
- ✅ **Campaign Creation** (`initializeCampaign`)
- 💰 **Contributions** (`contribute`)
- 💸 **Withdrawals** (`withdrawFunds`)
- 🔄 **Refunds** (`refund`)

Each transaction has its own unique hash that you can view on Solana Explorer!

## Pro Tips

1. **Save Important Hashes**: Copy transaction hashes for important campaigns
2. **Use Explorer**: Solana Explorer shows detailed transaction information
3. **Check Status**: Verify transactions are "Success" not "Failed"
4. **Network Matters**: Make sure you're viewing on the correct network (devnet/mainnet)

