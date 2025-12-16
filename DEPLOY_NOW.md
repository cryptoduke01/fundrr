# 🚀 DEPLOY YOUR PROGRAM NOW

## The Error You're Seeing

```
Transaction simulation failed: Attempt to load a program that does not exist
```

**This means your Solana program is NOT deployed to devnet yet!**

## Quick Fix - Deploy in 3 Steps

### Step 1: Navigate to Program Directory
```bash
cd src/program
```

### Step 2: Build the Program
```bash
anchor build
```

This will:
- Compile your Rust program
- Generate the IDL file
- Create the program binary

### Step 3: Deploy to Devnet
```bash
anchor deploy
```

**OR** if that doesn't work:
```bash
solana program deploy target/deploy/fundrr.so --program-id target/deploy/fundrr-keypair.json --url devnet
```

### Step 4: Copy IDL (Important!)
```bash
cp target/idl/fundrr.json ../../src/idl/fundrr.json
```

## Verify Deployment

```bash
solana program show 2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu --url devnet
```

If it shows program details, you're good! If it says "not found", the program isn't deployed.

## Get Devnet SOL

```bash
solana config set --url devnet
solana airdrop 2 $(solana address)
```

## After Deployment

1. Restart your frontend: `npm run dev`
2. Refresh your browser
3. Try creating a campaign again

The app will now work with your real deployed program!

## Troubleshooting

**"Insufficient funds"**
- Get more SOL: `solana airdrop 2 $(solana address)`

**"Program not found"**
- Make sure you deployed: `anchor deploy`
- Check program ID matches: `2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu`

**"Build failed"**
- Make sure Anchor is installed: `anchor --version`
- Make sure Rust is installed: `rustc --version`
- Try: `anchor clean && anchor build`

