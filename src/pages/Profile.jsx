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

  useEffect(() => {
    if (!connected) {
      navigate('/');
      return;
    }

    // Fetch SOL balance
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

    // Fetch SOL price
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

    // Set up intervals for regular updates
    const balanceInterval = setInterval(fetchBalance, 30000);
    const priceInterval = setInterval(fetchSolPrice, 60000);

    return () => {
      clearInterval(balanceInterval);
      clearInterval(priceInterval);
    };
  }, [publicKey, connected, connection]);

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

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!connected) {
    navigate('/');
    return null;
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* <Header /> */}

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700/50"
        >
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <span className="text-2xl font-bold text-white">
                {publicKey?.toString().slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">My Profile</h2>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-sm text-white shadow-lg">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 bg-gray-900/50 rounded-lg p-2 hover:bg-gray-900/70 transition-colors">
                <p className="text-gray-300 font-mono text-sm">
                  {shortenAddress(publicKey?.toString())}
                </p>
                <button
                  onClick={handleCopyAddress}
                  className="group relative flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-700 transition-all duration-300 cursor-pointer"
                  title="Copy address"
                >
                  {copied ? (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Wallet Balance Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Wallet Balance</h3>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <img
                      src={solanaLogoMark}
                      alt="SOL"
                      className="relative w-10 h-10 transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Available Balance</p>
                    <p className="text-2xl font-bold text-white">{balance?.toFixed(2)} SOL</p>
                  </div>
                </div>
                {balance !== null && solPrice !== null && (
                  <div className="text-center sm:text-right">
                    <p className="text-sm text-gray-400">USD Value</p>
                    <p className="text-2xl font-bold text-green-400">
                      ${(balance * solPrice).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-4"></div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Current SOL Price:</span>
                <span className="text-white font-medium">${solPrice?.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/30 hover:border-purple-500/50 transition-colors duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Campaigns Created</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">0</p>
              <p className="text-sm text-gray-400 mt-2">Total campaigns you've created</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/30 hover:border-green-500/50 transition-colors duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Total Contributions</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">0 SOL</p>
              <p className="text-sm text-gray-400 mt-2">Amount contributed to campaigns</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile; 