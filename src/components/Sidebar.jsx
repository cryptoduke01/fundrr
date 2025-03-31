import React, { useState } from 'react';
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
  Menu,
  X
} from 'lucide-react';
import solanaPowered from '../assets/solanaPowered.svg';

export function Sidebar() {
  const location = useLocation();
  const { disconnect } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
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
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 px-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">f</span>
          </div>
          <span className="text-xl font-bold text-white">fundrr</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden text-slate-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${location.pathname === item.path
              ? 'bg-purple-500/20 text-purple-500 translate-x-2'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'
              }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="space-y-4 pt-4">
        <div className="flex justify-center gap-6 pt-4 border-t border-slate-800">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
              title={link.label}
            >
              {link.icon}
            </a>
          ))}
        </div>

        <div className="flex justify-center">
          <img
            src={solanaPowered}
            alt="Powered by Solana"
            className="h-9 cursor-pointer"
          />
        </div>

        <button
          onClick={disconnect}
          className="w-full px-3 py-2.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 hover:translate-y-[-2px]"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Disconnect</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800/50 text-white hover:bg-slate-700/50 transition-colors backdrop-blur-sm"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <aside
          className={`fixed top-0 left-0 h-full w-[280px] bg-gradient-to-b from-black/90 to-slate-900/90 border-r border-slate-800 p-5 transform transition-all duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          <SidebarContent />
        </aside>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 h-full w-[280px] bg-gradient-to-b from-black/90 to-slate-900/90 border-r border-slate-800 p-5">
        <SidebarContent />
      </aside>

      {/* Main Content Margin */}
      <div className="lg:ml-[280px]"></div>
    </>
  );
}

export default Sidebar;