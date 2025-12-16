#!/bin/bash

# Try alternative RPC endpoints
RPC_ENDPOINTS=(
    "https://api.devnet.solana.com"
    "https://devnet.helius-rpc.com"
    "https://rpc.ankr.com/solana_devnet"
    "https://solana-devnet.g.alchemy.com/v2/demo"
)

echo "Trying to deploy program..."
echo "Deploy keypair: $(solana address -k ~/.config/solana/deploy.json)"
echo ""

for RPC in "${RPC_ENDPOINTS[@]}"; do
    echo "Trying RPC: $RPC"
    solana config set --url "$RPC" 2>&1 | head -3
    
    # Check balance first
    BALANCE=$(solana balance 2>&1)
    if [[ $? -eq 0 ]] && [[ ! "$BALANCE" =~ "Error" ]]; then
        echo "✅ RPC working! Balance: $BALANCE"
        echo "Deploying..."
        anchor deploy --provider.cluster devnet 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ Deployment successful!"
            exit 0
        fi
    else
        echo "❌ RPC not working, trying next..."
    fi
    echo ""
done

echo "❌ All RPC endpoints failed. Please try again later or use a different RPC."

