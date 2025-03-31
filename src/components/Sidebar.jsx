import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  User,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

const Sidebar = ({ onNavigate }) => {
  const location = useLocation();
  const { disconnect } = useWallet();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/discover', icon: Search, label: 'Discover' },
    { path: '/create', icon: PlusCircle, label: 'Create Campaign' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = () => {
    disconnect();
    onNavigate('/', 'Dashboard');
  };

  return (
    <div className="w-64 bg-[#0A0F1C] flex flex-col border-r border-gray-800/30">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
            Fundrr
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <motion.button
              key={item.path}
              onClick={() => onNavigate(item.path, item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${isActive
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/20'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-purple-500' : ''}`} />
              <span className={isActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 font-medium' : ''}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800/30">
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200"
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar;