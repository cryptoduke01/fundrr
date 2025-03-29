import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAnchorProgram } from './hooks/useAnchorProgram';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWalletContext } from './contexts/WalletContext';

// Import pages
import Dashboard from './pages/Dashboard';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';
import DiscoverCampaigns from './pages/DiscoverCampaigns';
import MyCampaigns from './pages/MyCampaigns';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Import components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CustomWalletButton from './components/CustomWalletButton';

// Import styles
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  const { publicKey, connected } = useWallet();
  const { setWalletModalOpen } = useWalletModal();
  const { setWalletModalVisible } = useWalletContext();
  const program = useAnchorProgram();

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white">
      {connected ? (
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/create" element={<CreateCampaign />} />
                <Route path="/campaign/:id" element={<CampaignDetails />} />
                <Route path="/discover" element={<DiscoverCampaigns />} />
                <Route path="/my-campaigns" element={<MyCampaigns />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C]">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-8">Welcome to Fundrr</h1>
            <CustomWalletButton />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;