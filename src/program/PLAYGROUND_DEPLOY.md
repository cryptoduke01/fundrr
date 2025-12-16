# Deploy via Solana Playground - Step by Step

## Files You Need
1. **Program Binary**: `target/deploy/fundrr.so`
2. **Program Keypair**: `target/deploy/fundrr-keypair.json` (for the program ID)
3. **IDL**: `target/idl/fundrr.json` (if available, or use `src/idl/fundrr.json`)

## Program Details
- **Program ID**: `2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu`
- **Deploy Wallet**: `2MKchn14AnGZG3DnkSrZwQepoRJ5QUezUeeeLgbXr8q6` (has 10 SOL)

## Steps in Solana Playground

### 1. Connect Your Wallet
- Click "Not connected" at the bottom
- Connect with Phantom, Solflare, or your Solana wallet
- Make sure you're on **Devnet** network
- Use the wallet that has the deploy keypair OR import the deploy keypair

### 2. Set Program ID
- In the "Program ID" section, click **"Import"**
- Enter: `2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu`
- OR click "New" if you want a different program ID (then update frontend)

### 3. Upload Program Binary
- Click on "> Program binary" to expand
- Click "Upload" or drag & drop
- Select: `src/program/target/deploy/fundrr.so`

### 4. Upload IDL (Optional but Recommended)
- Click on "> IDL" to expand  
- Click "Upload" or drag & drop
- Select: `src/idl/fundrr.json` or `src/program/target/idl/fundrr.json`

### 5. Deploy
- Click the pink **"Build"** button (or look for "Deploy" button)
- Confirm the transaction in your wallet
- Wait for deployment confirmation

## After Deployment

1. Verify deployment:
```bash
solana program show 2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu --url devnet
```

2. Your frontend should now work! The program ID is already configured in:
   - `src/contexts/ProgramContext.jsx`
   - `src/utils/programHelpers.js`

## Troubleshooting

**"Insufficient funds"**
- Make sure your connected wallet has devnet SOL
- You can airdrop: `solana airdrop 2 <your-wallet-address> --url devnet`

**"Program already deployed"**
- That's fine! You can upgrade it or use it as-is

**"Wrong network"**
- Make sure you're on **Devnet**, not Mainnet

