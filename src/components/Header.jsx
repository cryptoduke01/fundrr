import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { publicKey } = useWallet();
  const navigate = useNavigate();

  return (
    <header className="bg-[#0A0F1C] border-b border-gray-800/30 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <div
              className="cursor-pointer flex items-center gap-1 sm:gap-2"
              onClick={() => navigate('/')}
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm sm:text-base font-bold">f</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">fundrr</h1>
            </div>
          </div>
          <div className="scale-90 sm:scale-100">
            <WalletMultiButton className="!bg-[#1E293B] hover:!bg-[#2D3748] !text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;