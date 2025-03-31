import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Circle } from "lucide-react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

const SummaryStats = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [stats, setStats] = useState({
    balance: 0,
    totalContributed: 0,
    totalReceived: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (publicKey) {
        try {
          // Get wallet balance
          const balance = await connection.getBalance(publicKey);
          const solBalance = balance / 1_000_000_000; // Convert lamports to SOL

          // Get transaction history to calculate contributions and received funds
          const transactions = await connection.getSignaturesForAddress(publicKey, { limit: 100 });
          let totalContributed = 0;
          let totalReceived = 0;

          for (const tx of transactions) {
            const txDetails = await connection.getTransaction(tx.signature);
            if (txDetails?.meta?.postBalances && txDetails?.meta?.preBalances) {
              const balanceChange = (txDetails.meta.postBalances[0] - txDetails.meta.preBalances[0]) / 1_000_000_000;
              if (balanceChange < 0) {
                totalContributed += Math.abs(balanceChange);
              } else {
                totalReceived += balanceChange;
              }
            }
          }

          setStats({
            balance: solBalance,
            totalContributed,
            totalReceived
          });
        } catch (error) {
          console.error('Error fetching stats:', error);
        }
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300
      }
    }
  };

  const statsData = [
    { color: 'blue', label: 'Balance', amount: `${stats.balance.toFixed(2)} SOL` },
    { color: 'green', label: 'Contributed', amount: `${stats.totalContributed.toFixed(2)} SOL` },
    { color: 'purple', label: 'Received', amount: `${stats.totalReceived.toFixed(2)} SOL` }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex items-center justify-center gap-6 mb-8"
    >
      {statsData.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="flex items-center gap-2 hover:scale-105 transition-transform duration-300"
        >
          <Circle
            className={`h-3 w-3 fill-${stat.color}-500 text-${stat.color}-500`}
          />
          <span className="text-sm text-white">
            {stat.label}: {stat.amount}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SummaryStats;