import { Routes, Route } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Sparkles } from 'lucide-react';

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

function App() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-lg mx-auto text-center space-y-8 p-6 sm:p-8 md:p-10 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
          {/* Logo */}
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          {/* Welcome Text */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Fundrr</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-md mx-auto">
              Connect your wallet to start exploring decentralized crowdfunding on Solana
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
            {[
              { value: '$2.5M+', label: 'Total Raised' },
              { value: '15k+', label: 'Contributors' },
              { value: '500+', label: 'Campaigns' },
              { value: '98%', label: 'Success Rate' }
            ].map((stat) => (
              <div key={stat.label} className="p-3 sm:p-4 rounded-xl bg-slate-700/30 border border-slate-600/30">
                <div className="text-lg sm:text-xl font-bold text-purple-500">{stat.value}</div>
                <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Connect Wallet Section */}
          <div className="flex flex-col items-center gap-4">
            <CustomWalletButton />
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>New to Solana?</span>
              <a
                href="https://solana.com/ecosystem/explore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-500 hover:text-purple-400 transition-colors"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white">
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
              <Route path="/campaigns" element={<MyCampaigns />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;