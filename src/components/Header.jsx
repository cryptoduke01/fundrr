import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from "lucide-react";
import AuthButton from "./AuthButton";
import { useUser } from '@civic/auth-web3/react';


export function Header() {
  const userContext = useUser();
  const { user } = userContext;
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between mb-8"
    >
    <AuthButton />
      <div>
        <h1 className="text-2xl font-semibold text-white">Welcome, {user.name}!</h1>
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="
            h-10 w-10 
            rounded-full 
            bg-[#1E2330] 
            border border-slate-700 
            text-white 
            flex items-center 
            justify-center
          "
        >
          <Plus className="h-5 w-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="
            px-4 py-2 
            bg-blue-600 
            hover:bg-blue-700 
            text-white 
            rounded-full 
            font-medium 
            transition-colors
          "
        >
          Donate
        </motion.button>
      </div>
    </motion.div>
  );
}