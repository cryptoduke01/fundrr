import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import solanaLogoMark from '../assets/solanaLogoMark.png';

// import Header from '../components/Header';

const Profile = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [solPrice, setSolPrice] = useState(null);
  const [copied, setCopied] = useState(false);

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    if (!connected) {
      navigate('/');
      return;
    }

    const fetchBalance = async () => {
      if (publicKey) {
        try {
          const walletBalance = await connection.getBalance(publicKey);
          setBalance(walletBalance / 1_000_000_000);
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
  }, [publicKey, connected, connection, navigate]);

  const handleCopyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  if (!connected) {
    navigate('/');
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
          My Profile
        </h1>
        <p className="text-sm sm:text-base text-gray-400 mt-2">Manage your profile and view your contributions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Info Card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-800/50"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {publicKey?.toString().slice(0, 2)}
                </span>
              </div>
              <div className="mt-4 w-full">
                <div className="flex items-center justify-center gap-2 bg-gray-800/50 rounded-xl p-2 sm:p-3 hover:bg-gray-800/70 transition-colors">
                  <p className="font-mono text-xs sm:text-sm text-gray-300">
                    {shortenAddress(publicKey?.toString())}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="hover:bg-gray-700/50 p-1.5 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Balance Section */}
            <div className="mt-4 sm:mt-6">
              <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                      <img
                        src={solanaLogoMark}
                        alt="SOL"
                        className="relative w-8 h-8 sm:w-10 sm:h-10"
                      />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">Balance</p>
                      <p className="text-base sm:text-xl font-bold text-white">{balance ? `${balance.toFixed(2)} SOL` : '0.00 SOL'}</p>
                    </div>
                  </div>
                  {balance !== null && solPrice !== null && (
                    <div className="text-right">
                      <p className="text-xs sm:text-sm text-gray-400">Value</p>
                      <p className="text-base sm:text-xl font-bold text-green-500">
                        ${(balance * solPrice).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                <div className="mt-3 sm:mt-4 flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">SOL Price</span>
                  <span className="text-white font-medium">${solPrice ? solPrice.toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats and Activity */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-800/50"
            >
              <h3 className="text-base sm:text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                Campaigns Created
              </h3>
              <p className="text-2xl sm:text-3xl font-bold mt-2 text-white">0</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400">Total campaigns initiated</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-800/50"
            >
              <h3 className="text-base sm:text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                Total Contributed
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-2xl sm:text-3xl font-bold text-white">0</p>
                <div className="relative group w-5 h-5 sm:w-6 sm:h-6">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <img
                    src={solanaLogoMark}
                    alt="SOL"
                    className="relative w-full h-full"
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400">Across all campaigns</span>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-800/50"
          >
            <h3 className="text-base sm:text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
              Recent Activity
            </h3>
            <div className="mt-4">
              <div className="text-center text-gray-400 py-6 sm:py-8">
                No recent activity to display
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 