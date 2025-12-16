import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Zap, ArrowRight } from 'lucide-react';

// Import pages
import Dashboard from './pages/Dashboard';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';
import DiscoverCampaigns from './pages/DiscoverCampaigns';
import MyCampaigns from './pages/MyCampaigns';

// Import components
import Sidebar from './components/Sidebar';

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

const App = () => {
  const { connected, disconnect } = useWallet();
  const location = useLocation();
  const navigate = useNavigate();
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
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] dark:from-[#000000] dark:via-[#0a0a0a] dark:to-[#000000] flex items-center justify-center p-6 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl float-animation"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-white/3 rounded-full blur-3xl float-animation" style={{ animationDelay: '4s' }}></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-lg w-full relative z-10"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="inline-block mb-6"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                  <Zap className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <h1 className="text-6xl font-bold mb-4 gradient-text dark:text-white">
                Fundrr
              </h1>
              <p className="text-xl text-white/80 dark:text-white/60 font-light">
                Decentralized crowdfunding on Solana
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="glass-card rounded-3xl p-10 shadow-2xl border border-white/20"
            >
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Connect Wallet</h2>
                  <p className="text-white/60 text-sm">Connect your Solana wallet to get started</p>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <WalletMultiButton className="!w-full !justify-center !h-14 !rounded-xl !bg-white/10 hover:!bg-white/15 !text-white !font-medium !transition-all !shadow-lg !backdrop-blur-xl !border !border-white/20 hover:!border-white/30" />
                </motion.div>

                <div className="pt-6 border-t border-white/10">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-white">Fast</div>
                      <p className="text-xs text-white/50">Instant</p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-white">Secure</div>
                      <p className="text-xs text-white/50">Blockchain</p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-white">Low Fee</div>
                      <p className="text-xs text-white/50">Minimal</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center"
            >
              <p className="text-white/40 text-sm">Powered by Solana</p>
            </motion.div>
          </motion.div>
        </div>
      </AppSettingsContext.Provider>
    );
  }

  return (
    <AppSettingsContext.Provider value={settingsContextValue}>
      <div className="min-h-screen bg-white dark:bg-[#000000]">
        <div className="flex h-screen">
          <Sidebar
            onNavigate={(item) => {
              setCurrentPage(item);
              navigate(item);
            }}
            currentItem={currentPage}
            isLoading={false}
          />
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
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
