import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  LayoutDashboard,
  Search,
  FolderPlus,
  Folder,
  User,
  Settings,
  LogOut,
  Github,
  Twitter,
  Discord
} from 'lucide-react';
import solanaPowered from '../assets/solanaPowered.svg';

export function Sidebar() {
  const location = useLocation();
  const { disconnect } = useWallet();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/discover', icon: Search, label: 'Discover' },
    { path: '/create', icon: FolderPlus, label: 'Create Campaign' },
    { path: '/campaigns', icon: Folder, label: 'My Campaigns' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const socialLinks = [
    {
      icon: <Github className="w-5 h-5" />,
      href: 'https://github.com',
      label: 'GitHub'
    },
    {
      icon: <Twitter className="w-5 h-5" />,
      href: 'https://twitter.com',
      label: 'Twitter'
    },
    {
      icon: <Discord className="w-5 h-5" />,
      href: 'https://discord.com',
      label: 'Discord'
    }
  ];

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen bg-gradient-to-b from-black/80 to-slate-900/80 border-r border-slate-800 w-64">
      <div className="flex flex-col h-full px-4 py-6">
        <div className="flex items-center mb-8 px-2">
          <span className="text-2xl font-bold text-white">FloFi</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${location.pathname === item.path
                ? 'bg-purple-500/20 text-purple-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="space-y-6 pt-6">
          {/* Social Links */}
          <div className="flex justify-center gap-4 pt-6 border-t border-slate-800">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>

          {/* Solana Powered Logo */}
          <div className="flex justify-center py-4">
            <img
              src={solanaPowered}
              alt="Powered by Solana"
              className="h-8 opacity-75 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Disconnect Button */}
          <button
            onClick={disconnect}
            className="w-full px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>
    </aside>
  );
}