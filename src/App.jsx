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
      case '/campaign/e:id':
        return 'Loading campaign details...';
      default:
        return 'Loading...';
    }
  };

  // Handle navigation with loading state
  const handleNavigation = (path, itemName) => {
    // Don't show loading for any pages - just navigate directly
    navigate(path);
  };

  // Reset loading state after navigation
  useEffect(() => {
    // For all routes, show content immediately
    setShowContent(true);
    setIsLoading(false);
    setLoadingItem('');
    setLoadingMessage('');
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
        <div className="min-h-screen bg-background text-foreground">
          <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md w-full rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="bg-card p-6 sm:p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
                  className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                >
                  <img src="/logo.png" alt="Fundrr Logo" className="h-16 w-16" />
                </motion.div>

                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Solana Powered Funding for Web3 Creatives
                </h1>
                <p className="text-muted-foreground mb-6">
                  Fundrr uses Solana for fast and low-cost transactions
                </p>

                <div className="mb-8">
                  <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !rounded-lg !py-2 !px-4 !w-full !justify-center" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Connect your wallet to start fundraising
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-background p-3 rounded-lg">
                    <div className="font-bold text-xl">Fast</div>
                    <p className="text-muted-foreground text-sm">Near-instant transactions</p>
                  </div>
                  <div className="bg-background p-3 rounded-lg">
                    <div className="font-bold text-xl">Secure</div>
                    <p className="text-muted-foreground text-sm">Built on Solana blockchain</p>
                  </div>
                  <div className="bg-background p-3 rounded-lg">
                    <div className="font-bold text-xl">Low Fees</div>
                    <p className="text-muted-foreground text-sm">Minimal transaction costs</p>
                  </div>
                  <div className="bg-background p-3 rounded-lg">
                    <div className="font-bold text-xl">Global</div>
                    <p className="text-muted-foreground text-sm">Borderless fundraising</p>
                  </div>
                </div>
              </div>
            </motion.div>
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
              navigate(item);
            }}
            currentItem={currentPage}
            isLoading={isLoading}
          />
          <div className="flex-1 overflow-y-auto transition-all duration-200">
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
          </div>
        </div>
      </div>
    </AppSettingsContext.Provider>
  );
};

export default App;