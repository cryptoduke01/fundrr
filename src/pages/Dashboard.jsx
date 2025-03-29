import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import CustomWalletButton from "../components/CustomWalletButton";
// import Header from '../components/Header';
import SummaryStats from "../components/SummaryStats";
import { SummaryCards } from "../components/SummaryCards";
import { Statistics } from "../components/Statistics";
import Transactions from "../components/Transactions";
import { motion } from 'framer-motion';
import { CampaignService } from '../services/campaign';
import { useAnchorProgram } from '../hooks/useAnchorProgram';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [balance, setBalance] = useState(null);
  const [solPrice, setSolPrice] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const program = useAnchorProgram();

  // Fetch SOL price
  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        setSolPrice(data.solana.usd);
      } catch (error) {
        console.error("Error fetching SOL price:", error);
      }
    };
    fetchSolPrice();
    const intervalId = setInterval(fetchSolPrice, 60000); // Update price every minute
    return () => clearInterval(intervalId);
  }, []);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet.publicKey) {
        try {
          const walletBalance = await connection.getBalance(wallet.publicKey);
          setBalance(walletBalance / 1_000_000_000); // Convert lamports to SOL
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    if (wallet.connected) {
      fetchBalance();
      const intervalId = setInterval(fetchBalance, 30000);
      return () => clearInterval(intervalId);
    }
  }, [connection, wallet.publicKey, wallet.connected]);

  const handleCopyAddress = async () => {
    if (wallet.publicKey) {
      try {
        await navigator.clipboard.writeText(wallet.publicKey.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  // User not logged in - Enhanced sign-in page
  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-[#0A0F1D] flex flex-col items-center justify-center p-4">
        {/* Logo and title section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 bg-[#7C3AED] rounded-2xl mx-auto mb-4 flex items-center justify-center"
          >
            <span className="text-2xl font-bold text-white">F</span>
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-3">Welcome to Fundrr</h1>
          <p className="text-[#3B82F6] text-lg">The next-gen crowdfunding platform on Solana</p>
        </div>

        {/* Connect wallet section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-sm"
        >
          <div className="bg-[#0F1729] rounded-3xl p-6 border border-[#1E2943]">
            {/* Select Wallet Button */}
            <div className="mb-8">
              <CustomWalletButton />
            </div>

            {/* Popular Wallets Section */}
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-xs uppercase text-[#64748B] tracking-wider">Popular Wallets</span>
              </div>

              {/* Wallet Grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Phantom', letter: 'P' },
                  { name: 'Solflare', letter: 'S' },
                  { name: 'Ledger', letter: 'L' }
                ].map((wallet) => (
                  <motion.button
                    key={wallet.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="aspect-square flex flex-col items-center justify-center p-4 rounded-xl bg-[#151C2E] border border-[#1E2943] hover:border-[#3B82F6]/50 transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#7C3AED] flex items-center justify-center mb-2">
                      <span className="text-lg font-medium text-white">{wallet.letter}</span>
                    </div>
                    <span className="text-sm text-[#64748B]">{wallet.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Terms of service */}
            <p className="mt-6 text-center text-[#64748B] text-sm">
              By connecting, you agree to our{' '}
              <a href="#" className="text-[#3B82F6] hover:text-[#60A5FA] transition-colors">Terms of Service</a>
            </p>
          </div>
        </motion.div>

        {/* Bottom links */}
        <div className="mt-8 flex items-center gap-8">
          <a href="#" className="text-[#3B82F6] hover:text-[#60A5FA] transition-colors text-sm">How it works</a>
          <span className="w-1 h-1 rounded-full bg-[#3B82F6]"></span>
          <a href="#" className="text-[#3B82F6] hover:text-[#60A5FA] transition-colors text-sm">Projects</a>
          <span className="w-1 h-1 rounded-full bg-[#3B82F6]"></span>
          <a href="#" className="text-[#3B82F6] hover:text-[#60A5FA] transition-colors text-sm">About</a>
        </div>
      </div>
    );
  }

  const shortAddress = wallet.publicKey ? `${wallet.publicKey.toString().slice(0, 6)}...${wallet.publicKey.toString().slice(-6)}` : '';

  return (
    <div className="flex min-h-screen bg-slate-950">
      <div className="flex-1 p-8">
        {/* <Header /> */}

        {/* Wallet Info */}
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg text-white mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span>Wallet:</span>
            <div className="flex items-center gap-1">
              <span className="text-blue-300">{shortAddress}</span>
              <button
                onClick={handleCopyAddress}
                className="group relative flex items-center justify-center w-6 h-6 rounded-md hover:bg-gray-700 transition-colors cursor-pointer ml-0.5"
                title="Copy address"
              >
                {copied ? (
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-blue-300 group-hover:text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {balance !== null && (
            <div className="flex items-center gap-4">
              {solPrice && (
                <p className="text-lg font-medium text-gray-300">
                  ${(balance * solPrice).toFixed(2)}
                </p>
              )}
              <div className="flex items-center gap-2">
                <img
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTM3LjQ0IDI4LjMxYTEuMjEgMS4yMSAwIDAgMC0xLjIyLTEuMjJoLTMuMjJhNy4yMyA3LjIzIDAgMCAwLTcuMjMgNy4yM3YzLjIyYTEuMjEgMS4yMSAwIDAgMCAxLjIyIDEuMjJoMy4yMmE3LjIzIDcuMjMgMCAwIDAgNy4yMy03LjIzdi0zLjIyWiIgZmlsbD0idXJsKCNhKSIvPjxwYXRoIGQ9Ik0yNS43NyAyLjI0YTEuMjEgMS4yMSAwIDAgMC0xLjIyIDEuMjJ2My4yMmE3LjIzIDcuMjMgMCAwIDAgNy4yMyA3LjIzaDMuMjJhMS4yMSAxLjIxIDAgMCAwIDEuMjItMS4yMlY5LjQ3YTcuMjMgNy4yMyAwIDAgMC03LjIzLTcuMjNoLTMuMjJaIiBmaWxsPSJ1cmwoI2IpIi8+PHBhdGggZD0iTTIuMjQgMTEuNjlhMS4yMSAxLjIxIDAgMCAwIDEuMjIgMS4yMmgzLjIyYTcuMjMgNy4yMyAwIDAgMCA3LjIzLTcuMjNWMi40NmExLjIxIDEuMjEgMCAwIDAtMS4yMi0xLjIySDkuNDdhNy4yMyA3LjIzIDAgMCAwLTcuMjMgNy4yM3YzLjIyWiIgZmlsbD0idXJsKCNjKSIvPjxwYXRoIGQ9Ik0xMy45MSAzNy43NmExLjIxIDEuMjEgMCAwIDAgMS4yMi0xLjIydi0zLjIyYTcuMjMgNy4yMyAwIDAgMC03LjIzLTcuMjNIMy42OGExLjIxIDEuMjEgMCAwIDAtMS4yMiAxLjIydjMuMjJhNy4yMyA3LjIzIDAgMCAwIDcuMjMgNy4yM2gzLjIyWiIgZmlsbD0idXJsKCNkKSIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iYSIgeDE9IjI1Ljc3IiB5MT0iMTkuODYiIHgyPSIzNy40NCIgeTI9IjE5Ljg2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzAwRkZBMyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0RDMUZGRiIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJiIiB4MT0iMjUuNzciIHkxPSI3LjIzIiB4Mj0iMzcuNDQiIHkyPSI3LjIzIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzAwRkZBMyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0RDMUZGRiIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJjIiB4MT0iMi4yNCIgeTE9IjcuMjMiIHgyPSIxMy45MSIgeTI9IjcuMjMiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjMDBGRkEzIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjREMxRkZGIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImQiIHgxPSIyLjI0IiB5MT0iMzIuNzciIHgyPSIxMy45MSIgeTI9IjMyLjc3IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzAwRkZBMyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0RDMUZGRiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg=="
                  alt="SOL"
                  className="w-5 h-5"
                />
                <p className="text-lg font-medium text-green-400">
                  {balance.toFixed(2)} SOL
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <div className="lg:col-span-2 space-y-6">
            <SummaryStats />
            <SummaryCards />
            <Statistics />
          </div>
          <div>
            <Transactions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;