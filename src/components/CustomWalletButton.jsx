import React, { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const CustomWalletButton = () => {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const navigate = useNavigate();

  const shortAddress = useMemo(() => {
    if (!publicKey) return '';
    const address = publicKey.toString();
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }, [publicKey]);

  // For a connected wallet, we show a custom button
  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2"
        >
          <img
            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${publicKey}`}
            alt="Wallet Avatar"
            className="h-6 w-6 rounded-full"
          />
          <span>{shortAddress}</span>
        </Button>
      </div>
    );
  }

  // Use the default wallet button with custom styling
  return (
    <WalletMultiButton
      className="!bg-primary hover:!bg-primary/90 !text-white"
    />
  );
};

export default CustomWalletButton;