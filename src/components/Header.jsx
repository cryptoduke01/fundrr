import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { publicKey } = useWallet();
  const navigate = useNavigate();

  return (
    <header className="bg-[#0A0F1C] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div
              className="cursor-pointer flex items-center gap-2"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">f</span>
              </div>
              <h1 className="text-xl font-bold text-white">fundrr</h1>
            </div>
          </div>
          <WalletMultiButton className="!bg-[#1E293B] hover:!bg-[#2D3748] !text-white" />
        </div>
      </div>
    </header>
  );
};

export default Header;