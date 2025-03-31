import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import solanaLogoMark from '../assets/solanaLogoMark.png';

export function SummaryCards() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);
  const [solPrice, setSolPrice] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        try {
          const walletBalance = await connection.getBalance(publicKey);
          setBalance(walletBalance / 1_000_000_000); // Convert lamports to SOL
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    const fetchSolPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        setSolPrice(data.solana.usd);
      } catch (error) {
        console.error("Error fetching SOL price:", error);
      }
    };

    fetchBalance();
    fetchSolPrice();

    const balanceInterval = setInterval(fetchBalance, 30000);
    const priceInterval = setInterval(fetchSolPrice, 60000);

    return () => {
      clearInterval(balanceInterval);
      clearInterval(priceInterval);
    };
  }, [publicKey, connection]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: (custom) => ({
      width: `${custom}%`,
      transition: {
        duration: 1,
        ease: "easeInOut"
      }
    })
  };

  const SolanaIcon = () => (
    <img
      src={solanaLogoMark}
      alt="SOL"
      className="inline-block ml-1 w-5 h-5"
    />
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
    >
      <div className="grid gap-6">
        <motion.div
          variants={cardVariants}
          className="rounded-2xl bg-gradient-to-br from-black/80 to-slate-900/80 p-6 border border-slate-800 shadow-2xl"
        >
          <div className="mb-2 text-sm text-slate-400">Total Funds Raised</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl font-bold text-white"
                >
                  {balance.toFixed(2)}
                </motion.span>
                <span className="text-xl text-slate-400 flex items-center">
                  <SolanaIcon />
                </span>
              </div>
              <div className="text-sm text-slate-400">
                ≈ ${(balance * solPrice).toFixed(2)} USD
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex items-center gap-2"
            >
              <div className="rounded-full bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-500">
                3 Active
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="rounded-2xl bg-gradient-to-br from-black/80 to-slate-900/80 p-6 border border-slate-800 shadow-2xl"
        >
          <div className="mb-2 text-sm text-slate-400">Your Contributions</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl font-bold text-white"
                >
                  {(balance / 2).toFixed(2)}
                </motion.span>
                <span className="text-xl text-slate-400 flex items-center">
                  <SolanaIcon />
                </span>
              </div>
              <div className="text-sm text-slate-400">
                ≈ ${((balance / 2) * solPrice).toFixed(2)} USD
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                variants={progressVariants}
                custom={65}
                initial="hidden"
                animate="visible"
                className="h-full bg-purple-800"
              />
            </div>
            <div className="mt-2 text-xs text-slate-400 text-right">
              65% of goal reached
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={cardVariants}
        className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-black/80 p-6 flex flex-col shadow-2xl"
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="text-sm text-slate-400">Charity Fund Status</div>
          <div className="flex items-baseline">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-white"
            >
              {(balance / 2).toFixed(2)}
            </motion.span>
            <span className="text-xl text-slate-400 flex items-center">
              <SolanaIcon />
            </span>
          </div>
          <div className="text-sm text-slate-400">
            ≈ ${((balance / 2) * solPrice).toFixed(2)} USD
          </div>
          <div className="text-sm text-slate-400">
            Total Impact Made
          </div>
        </div>

        <div className="mt-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 ease-in-out">
              Create Campaign
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}