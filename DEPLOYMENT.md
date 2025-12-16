# Fundrr Deployment Guide

## Prerequisites

1. **Install Solana CLI**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

2. **Install Anchor**
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   ```

3. **Install Rust**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

## Deployment Steps

### 1. Configure Solana CLI for Devnet

```bash
solana config set --url devnet
solana config get
```

### 2. Create/Check Your Wallet

```bash
# Check if you have a wallet
solana address

# If not, create one
solana-keygen new --outfile ~/.config/solana/deploy.json
```

### 3. Airdrop SOL to Your Wallet (Devnet)

```bash
solana airdrop 2 $(solana address)
```

### 4. Build the Program

```bash
cd src/program
anchor build
```

This will:
- Compile the Rust program
- Generate the IDL (Interface Definition Language)
- Create the program binary at `target/deploy/fundrr.so`

### 5. Deploy the Program

```bash
# Make sure you're in the program directory
cd src/program

# Deploy to devnet
anchor deploy
```

Or manually:
```bash
solana program deploy target/deploy/fundrr.so --program-id target/deploy/fundrr-keypair.json
```

### 6. Verify Deployment

```bash
# Check your program
solana program show 2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu
```

### 7. Update IDL in Frontend

After deployment, copy the generated IDL:
```bash
cp src/program/target/idl/fundrr.json src/idl/fundrr.json
```

## Troubleshooting

### Program Already Deployed
If the program ID `2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu` is already deployed, you can:
1. Use the existing deployment (recommended for devnet)
2. Or deploy to a new program ID by generating a new keypair

### Insufficient Funds
```bash
solana balance
solana airdrop 2 $(solana address)
```

### Build Errors
- Make sure you're using the correct Anchor version (0.31.0)
- Check that all dependencies are installed
- Try `anchor clean` then `anchor build`

## Program ID

The program is configured with ID: `2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu`

This is set in:
- `src/program/programs/fundrr/src/lib.rs` (declare_id!)
- `src/program/Anchor.toml` (programs.devnet)
- `src/contexts/ProgramContext.jsx` (PROGRAM_ID)
- `src/utils/programHelpers.js` (PROGRAM_ID)

## Quick Deploy Script

```bash
#!/bin/bash
cd src/program
anchor build
anchor deploy
cp target/idl/fundrr.json ../../src/idl/fundrr.json
echo "Deployment complete!"
```

