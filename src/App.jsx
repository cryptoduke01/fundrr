import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

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

// Create AppSettings context
export const AppSettingsContext = createContext({
  theme: 'Dark',
  setTheme: () => { },
  language: 'English',
  setLanguage: () => { },
  reduceAnimations: false,
  setReduceAnimations: () => { },
  autoLockTimer: 10,
  setAutoLockTimer: () => { },
});

// Loading Spinner Component
const LoadingSpinner = ({ itemName, message }) => {
  const { reduceAnimations } = useContext(AppSettingsContext);
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0A0F1C] z-50">
      <div className={`w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full ${reduceAnimations ? '' : 'animate-spin'}`}></div>
      <h2 className="mt-4 text-xl font-medium text-white">Loading {itemName}</h2>
      <p className="mt-2 text-sm text-gray-400">{message}</p>
    </div>
  );
};

const App = () => {
  const { connected, disconnect } = useWallet();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard');

  // App settings
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'Dark';
  });
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'English';
  });
  const [reduceAnimations, setReduceAnimations] = useState(() => {
    const savedValue = localStorage.getItem('reduceAnimations');
    return savedValue === 'true';
  });
  const [autoLockTimer, setAutoLockTimer] = useState(() => {
    const savedTimer = localStorage.getItem('autoLockTimer');
    return savedTimer ? parseInt(savedTimer) : 10;
  });
  const [autoLockTimerId, setAutoLockTimerId] = useState(null);

  // Persist settings in localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('language', language);
    localStorage.setItem('reduceAnimations', reduceAnimations);
    localStorage.setItem('autoLockTimer', autoLockTimer.toString());
  }, [theme, language, reduceAnimations, autoLockTimer]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'Dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'Light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else if (theme === 'System') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Auto-disconnect wallet timer
  useEffect(() => {
    if (!connected) return;

    if (autoLockTimerId) {
      clearTimeout(autoLockTimerId);
    }

    const timerId = setTimeout(() => {
      disconnect();
      console.log('Auto-disconnected wallet after', autoLockTimer, 'minutes');
    }, autoLockTimer * 60 * 1000);

    setAutoLockTimerId(timerId);

    return () => {
      if (autoLockTimerId) {
        clearTimeout(autoLockTimerId);
      }
    };
  }, [autoLockTimer, disconnect, connected]);

  // Reset timer on user activity
  useEffect(() => {
    if (!connected) return;

    const resetTimer = () => {
      if (autoLockTimerId) {
        clearTimeout(autoLockTimerId);
        const timerId = setTimeout(() => {
          disconnect();
          console.log('Auto-disconnected wallet after', autoLockTimer, 'minutes');
        }, autoLockTimer * 60 * 1000);
        setAutoLockTimerId(timerId);
      }
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [autoLockTimer, autoLockTimerId, disconnect, connected]);

  const getLoadingMessage = (path) => {
    switch (path) {
      case '/discover':
        return 'Fetching available campaigns...';
      case '/create-campaign':
        return 'Preparing campaign creation form...';
      case '/profile':
        return 'Loading your profile data...';
      case '/settings':
        return 'Loading your preferences...';
      case '/my-campaigns':
        return 'Fetching your campaign history...';
      case '/campaign/:id':
        return 'Loading campaign details...';
      default:
        return 'Loading...';
    }
  };

  // Handle navigation with loading state
  const handleNavigation = (path, itemName) => {
    // Don't show loading spinner for dashboard since it has its own
    if (path === '/') {
      navigate(path);
      return;
    }

    // First hide content and show loader
    setShowContent(false);
    setIsLoading(true);
    setLoadingItem(itemName);
    setLoadingMessage(getLoadingMessage(path));

    // Delay navigation slightly to ensure loader shows first
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  // Reset loading state after navigation
  useEffect(() => {
    // Show dashboard content immediately
    if (location.pathname === '/') {
      setShowContent(true);
      setIsLoading(false);
      setLoadingItem('');
      setLoadingMessage('');
      return;
    }

    // For other routes, manage loading state
    const timer = setTimeout(() => {
      setShowContent(true);
      setIsLoading(false);
      setLoadingItem('');
      setLoadingMessage('');
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Initial setup
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === '/') {
      setShowContent(true);
    } else {
      setShowContent(false);
      setIsLoading(true);
      const pageName = currentPath.split('/')[1];
      setLoadingItem(pageName.charAt(0).toUpperCase() + pageName.slice(1));
      setLoadingMessage(getLoadingMessage(currentPath));
    }
  }, []);

  // Create settings context value
  const settingsContextValue = {
    theme,
    setTheme,
    language,
    setLanguage,
    reduceAnimations,
    setReduceAnimations,
    autoLockTimer,
    setAutoLockTimer,
  };

  if (!connected) {
    return (
      <AppSettingsContext.Provider value={settingsContextValue}>
        <div className="min-h-screen bg-gray-950 text-white">
          <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="max-w-md w-full mx-auto">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-2xl inline-block mb-4">
                  <img src="/logo.png" alt="FloFi Logo" className="h-16 w-16" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                  Welcome to FloFi
                </h1>
                <p className="text-gray-400 text-base sm:text-lg md:text-xl">
                  The decentralized funding platform for everyone
                </p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 md:p-8 mb-6">
                <div className="mb-8 text-center">
                  <h2 className="text-xl font-semibold mb-2">Connect your wallet to continue</h2>
                  <p className="text-gray-400 text-sm">
                    FloFi uses Solana for fast and low-cost transactions
                  </p>
                </div>
                <div className="flex justify-center">
                  <WalletMultiButton className="!bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 !rounded-xl !py-3 !px-6 !w-full !justify-center !h-auto !text-base" />
                </div>
                <div className="mt-5 text-center">
                  <a
                    href="https://solana.com/ecosystem/explore"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-sm underline transition"
                  >
                    New to Solana? Learn more
                  </a>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-medium mb-4 text-center">Platform Stats</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                      100+
                    </p>
                    <p className="text-gray-400 text-sm">Campaigns</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                      50K+
                    </p>
                    <p className="text-gray-400 text-sm">Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                      1000+
                    </p>
                    <p className="text-gray-400 text-sm">Contributions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                      500+
                    </p>
                    <p className="text-gray-400 text-sm">SOL Raised</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppSettingsContext.Provider>
    );
  }

  return (
    <AppSettingsContext.Provider value={settingsContextValue}>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="flex flex-col md:flex-row h-screen">
          <Sidebar
            onNavigate={(item) => {
              setCurrentPage(item);
              setIsLoading(true);
            }}
            currentItem={currentPage}
            isLoading={isLoading}
          />
          <div className="flex-1 overflow-y-auto transition-all duration-200">
            {isLoading && currentPage !== 'Dashboard' &&
              currentPage !== 'Campaign Details' &&
              currentPage !== 'Create Campaign' ? (
              <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-t-transparent border-purple-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-lg text-purple-400 font-medium">Loading {currentPage}...</p>
                </div>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />

                {/* Campaign routes */}
                <Route path="/discover" element={<DiscoverCampaigns />} />
                <Route path="/my-campaigns" element={<MyCampaigns />} />
                <Route path="/campaign/:id" element={<CampaignDetails />} />
                <Route path="/create-campaign" element={<CreateCampaign />} />
              </Routes>
            )}
          </div>
        </div>
      </div>
    </AppSettingsContext.Provider>
  );
};

export default App;