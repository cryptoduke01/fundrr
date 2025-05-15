# Fundrr Demo Day Checklist

## Setup

1. **Ensure you have a Phantom wallet installed and connected to Devnet**

   - Open Phantom wallet extension
   - Click on the network selector (typically shows "Mainnet")
   - Select "Devnet"

2. **Ensure you have SOL in your wallet**

   - You can get free SOL on devnet using: `solana airdrop 2`
   - Or use the faucet: https://faucet.solana.com/

3. **Check program deployment**
   - The program ID should be: `2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu`
   - Verify it exists on devnet: `solana program show 2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu`
   - If it doesn't exist, you'll need to deploy it

## Starting the Application

1. **Start the application locally**

   ```
   pnpm dev
   ```

2. **Connect your wallet**
   - Click "Connect Wallet" button
   - Select your Phantom wallet
   - Approve the connection

## Demo Workflow

1. **Create a Campaign**

   - Navigate to "Create Campaign"
   - Fill in details (name, description, goal amount, duration)
   - Click "Create Campaign"
   - Approve the transaction in your wallet

2. **View Campaigns**

   - Navigate to "Discover" to see all campaigns
   - Or "My Campaigns" to see your created campaigns
   - Click on a campaign to see details

3. **Contribute to a Campaign**

   - Open a campaign
   - Enter contribution amount
   - Click "Contribute"
   - Approve the transaction

4. **Withdraw Funds (if you're the creator)**
   - Navigate to your campaign
   - Click "Withdraw Funds"
   - Approve the transaction

## Troubleshooting

If transactions fail, check:

1. **Wallet Connection**

   - Make sure wallet is connected to Devnet
   - Make sure you have enough SOL

2. **Program Deployment**

   - If the program isn't deployed correctly, you'll get errors
   - Run the deploy script: `node deploy-program.js`

3. **Browser Console**

   - Open developer tools (F12)
   - Check console for any error messages

4. **Restart Application**
   - Sometimes a simple restart fixes connection issues
   - Kill the running process and restart: `pnpm dev`
