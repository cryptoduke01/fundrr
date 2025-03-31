import { Routes, Route } from 'react-router-dom';

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
import WalletConnectionProvider from './contexts/WalletConnectionProvider';

function App() {
  return (
    <WalletConnectionProvider>
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
    </WalletConnectionProvider>
  );
}

export default App;