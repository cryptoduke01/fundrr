import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useNavigate } from 'react-router-dom';
import CustomWalletButton from './CustomWalletButton';

const Header = () => {
  const { publicKey } = useWallet();
  const navigate = useNavigate();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div
              className="cursor-pointer flex items-center gap-2"
              onClick={() => navigate('/')}
            >
              <img
                src="/logo.png"
                alt="Fundrr Logo"
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-bold text-primary">Fundrr</h1>
            </div>
          </div>
          <div className="flex items-center">
            <CustomWalletButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;