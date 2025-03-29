import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  PlusCircle,
  Search,
  FolderOpen,
  User,
  Settings,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/create', icon: PlusCircle, label: 'Create Campaign' },
    { path: '/discover', icon: Search, label: 'Discover' },
    { path: '/my-campaigns', icon: FolderOpen, label: 'My Campaigns' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-[#0A0F1C] border-r border-gray-800 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">F</span>
          </div>
          <span className="text-xl font-bold text-white">Fundrr</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-[#1E293B] text-white'
                    : 'text-gray-400 hover:bg-[#1E293B] hover:text-white'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#1E293B] hover:text-white transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;