import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Plus,
  Briefcase
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

const Sidebar = ({ onNavigate, currentItem, isLoading }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { disconnect } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Discover', icon: Search, path: '/discover' },
    { name: 'My Campaigns', icon: Briefcase, path: '/my-campaigns' },
    { name: 'Create Campaign', icon: Plus, path: '/create-campaign' },
    { name: 'Profile', icon: User, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = () => {
    disconnect();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (path, label) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-full bg-gray-800/70 backdrop-blur-sm text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed md:relative w-64 h-screen glass-card flex flex-col border-r border-gray-200/50 dark:border-gray-800/50 z-40 transition-all duration-300 ${isMobileMenuOpen ? 'left-0' : '-left-full md:left-0'
          }`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Fundrr
          </h1>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto">
          {sidebarItems.filter(item => !['Profile', 'Settings'].includes(item.name)).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.button
                key={item.path}
                onClick={() => handleNavigation(item.path, item.name)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-black dark:bg-white text-white dark:text-black font-semibold shadow-lg'
                    : 'text-gray-600 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-black/10 dark:border-white/10">
          <motion.button
            onClick={handleLogout}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Disconnect</span>
          </motion.button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </>
  );
};

export default Sidebar;