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
  Sparkles,
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
        className={`fixed md:relative w-64 md:w-64 h-screen bg-[#0A0F1C] flex flex-col border-r border-gray-800/30 z-40 transition-all duration-300 ${isMobileMenuOpen ? 'left-0' : '-left-full md:left-0'
          }`}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
              Fundrr
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-3 md:px-4 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.button
                key={item.path}
                onClick={() => handleNavigation(item.path, item.name)}
                className={`w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/20'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-500' : ''}`} />
                <span className={isActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 font-medium' : ''}>
                  {item.name}
                </span>
              </motion.button>
            );
          })}
        </nav>

        <div className="p-3 md:p-4 border-t border-gray-800/30">
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200"
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
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