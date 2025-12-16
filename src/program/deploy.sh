#!/bin/bash

echo "Checking deploy keypair balance..."
solana balance

echo ""
echo "Deploying program to devnet..."
anchor deploy --provider.cluster devnet

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "Copying IDL to frontend..."
    cp target/idl/fundrr.json ../../src/idl/fundrr.json 2>/dev/null || echo "IDL already exists or build didn't generate it"
else
    echo ""
    echo "❌ Deployment failed. Make sure you have devnet SOL in the deploy keypair."
    echo "Deploy keypair address: $(solana address -k ~/.config/solana/deploy.json)"
fi

