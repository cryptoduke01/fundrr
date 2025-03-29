import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ArrowDownToLine,
  TrendingUp,
  CreditCard,
  Calculator,
  Settings,
  CreditCardIcon as PaymentIcon,
  User,
  Plus,
  Menu,
  X
} from "lucide-react";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Home", path: "#" },  // General overview
    { icon: PaymentIcon, label: "Discover Campaigns", path: "#" },  // Explore other fundraising campaigns
    { icon: Plus, label: "Create Campaign", path: "#" },  // Start a new fundraising campaign
    { icon: TrendingUp, label: "My Campaigns", path: "#" },  // View and manage your campaigns
    { icon: ArrowDownToLine, label: "Withdraw Funds", path: "#" },  // Withdraw raised funds
    { icon: CreditCard, label: "Contributions", path: "#" },  // Track your donations to campaigns
    { icon: User, label: "Profile", path: "#" },  // User account settings
    { icon: Settings, label: "Settings", path: "#" }  // App preferences
  ];
  
  return (
    <>
      {/* Mobile Menu Toggle */}
      <motion.button 
        onClick={toggleSidebar} 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed top-4 left-4 z-50 md:hidden bg-purple-600 p-2 rounded-full text-white"
      >
        {isOpen ? <X /> : <Menu />}
      </motion.button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 
        w-64 
        bg-gradient-to-br from-black/80 to-slate-900/80
        text-white 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative
        flex flex-col
        border-r border-slate-800
        overflow-y-auto
        shadow-2xl
      `}>
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 border-b border-slate-800 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-semibold">fundrr</span>
          </div>
        </motion.div>

        {/* Navigation Items */}
        <nav className="flex-grow p-4 space-y-1">
          {sidebarItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: index * 0.05,
                duration: 0.3 
              }}
            >
              <Link 
                to={item.path} 
                className="
                  flex items-center gap-3 
                  px-4 py-3 
                  rounded-lg 
                  hover:bg-purple-600/20 
                  transition-colors 
                  group
                "
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <item.icon 
                    className="
                      w-5 h-5 
                      text-slate-400 
                      group-hover:text-purple-500 
                      transition-colors
                    " 
                  />
                </motion.div>
                <span className="
                  text-slate-300 
                  group-hover:text-white 
                  transition-colors
                ">
                  {item.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* User Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="
            p-4 
            border-t border-slate-800 
            flex items-center 
            gap-3
          "
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="
              h-12 w-12 
              rounded-full 
              bg-purple-600/20 
              border-2 border-purple-600 
              flex items-center 
              justify-center
            "
          >
            <span className="text-white font-semibold">DL</span>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Daniel Lewis</span>
          </div>
        </motion.div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar} 
            className="
              fixed inset-0 
              bg-black/50 
              z-30 
              md:hidden
            "
          />
        )}
      </AnimatePresence>
    </>
  );
}