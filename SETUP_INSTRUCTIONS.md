# Fundrr Setup & Deployment Instructions

## ✅ What I Fixed

1. **Removed all simulation/mock code** - Now uses real Solana devnet transactions
2. **Fixed TransactionHistory component** - Now fetches real transactions from blockchain
3. **Removed unused imports** - Cleaned up App.jsx (removed Profile, Settings, Header, CustomWalletButton)
4. **Updated all program helpers** - All functions now interact with real deployed program
5. **Redesigned UI** - Minimal, classy design with proper dark mode support

## 🚨 Current Issues Fixed

- ✅ `getTransactionHistory` export error - Fixed by updating TransactionHistory to fetch from blockchain
- ✅ Blank page - Fixed by removing unused component imports
- ✅ All mock data removed - Everything now uses real on-chain data

## 📋 What You Need to Do

### Step 1: Verify Rust Program is Deployed

The program ID is already set: `2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu`

**Check if it's already deployed:**
```bash
solana program show 2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu --url devnet
```

If it shows the program, you're good! If not, deploy it:

### Step 2: Deploy the Program (if needed)

```bash
# 1. Navigate to program directory
cd src/program

# 2. Build the program
anchor build

# 3. Deploy to devnet
anchor deploy

# 4. Copy the IDL to frontend
cp target/idl/fundrr.json ../../src/idl/fundrr.json
```

### Step 3: Verify Your Setup

1. **Check Solana CLI is configured for devnet:**
   ```bash
   solana config get
   # Should show: RPC URL: https://api.devnet.solana.com
   ```

2. **Check you have SOL in your wallet:**
   ```bash
   solana balance
   # If 0, get some: solana airdrop 2 $(solana address)
   ```

3. **Verify program is accessible:**
   ```bash
   solana program show 2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu --url devnet
   ```

### Step 4: Run the Frontend

```bash
# From project root
npm install  # if needed
npm run dev
```

## 🔍 Program Structure

The Rust program is located at: `src/program/programs/fundrr/src/lib.rs`

**Key Functions:**
- `initialize_campaign` - Creates a new campaign (PDA: `[b"campaign", creator.key()]`)
- `contribute` - Contributes SOL to a campaign
- `withdraw_funds` - Withdraws funds (creator only, after goal met or deadline)
- `refund` - Refunds contributors (if goal not met after deadline)

**Program ID:** `2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu`

## 🐛 Troubleshooting

### "Program not found" error
- Make sure program is deployed: `anchor deploy` from `src/program/`
- Verify program ID matches in all files

### "Insufficient funds" error
- Get devnet SOL: `solana airdrop 2 $(solana address)`

### "Transaction failed" errors
- Check you're on devnet: `solana config get`
- Verify program is deployed and accessible
- Check browser console for detailed error messages

### Blank page / Import errors
- Clear browser cache
- Restart dev server: `npm run dev`
- Check console for any remaining import errors

## 📁 Important Files

- **Program:** `src/program/programs/fundrr/src/lib.rs`
- **IDL:** `src/idl/fundrr.json` (auto-generated after build)
- **Program Context:** `src/contexts/ProgramContext.jsx`
- **Helpers:** `src/utils/programHelpers.js`
- **Config:** `src/program/Anchor.toml`

## ✅ Verification Checklist

- [ ] Solana CLI installed and configured for devnet
- [ ] Anchor installed (version 0.31.0)
- [ ] Program built successfully (`anchor build`)
- [ ] Program deployed to devnet (`anchor deploy`)
- [ ] IDL copied to `src/idl/fundrr.json`
- [ ] Frontend runs without errors (`npm run dev`)
- [ ] Can connect wallet
- [ ] Can create a campaign
- [ ] Can view campaigns

## 🎯 Quick Start Commands

```bash
# 1. Setup (one time)
cd src/program
anchor build
anchor deploy
cp target/idl/fundrr.json ../../src/idl/fundrr.json

# 2. Run frontend
cd ../..
npm run dev
```

That's it! Your app should now work with real devnet transactions.

