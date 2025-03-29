import { useEffect, useState } from "react";
import { useUser } from "@civic/auth-web3/react";
import { userHasWallet } from "@civic/auth-web3";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import SummaryStats from "../components/SummaryStats";
import { SummaryCards } from "../components/SummaryCards";
import { Statistics } from "../components/Statistics";
import Transactions from "../components/Transactions";

const Dashboard = () => {
  const userContext = useUser();
  const { user, signIn, signOut, isLoading } = userContext;
  const { connection } = useConnection();
  const [walletCreating, setWalletCreating] = useState(false);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);

  // Automatically create wallet when user logs in
  useEffect(() => {
    const createWalletForUser = async () => {
      if (user && !userHasWallet(userContext) && !walletCreating) {
        try {
          setWalletCreating(true);
          setError(null);
          await userContext.createWallet();
          console.log("Wallet created successfully");
        } catch (error) {
          console.error("Error creating wallet:", error);
          setError("Failed to create wallet. Please try again.");
        } finally {
          setWalletCreating(false);
        }
      }
    };

    createWalletForUser();
  }, [user, userContext]);

  // Fetch wallet balance when wallet is available
  useEffect(() => {
    if (user && userHasWallet(userContext) && userContext.solana?.wallet?.publicKey) {
      const fetchBalance = async () => {
        try {
          const walletBalance = await connection.getBalance(userContext.solana.wallet.publicKey);
          setBalance(walletBalance / 1_000_000_000); // Convert lamports to SOL
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      };
      
      fetchBalance();
      
      // Set up interval to refresh balance every 30 seconds
      const intervalId = setInterval(fetchBalance, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [userContext, connection, user]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 mb-4 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // User not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white">
        <h1 className="text-3xl font-bold mb-6">Welcome to Fundrr</h1>
        <p className="text-gray-300 mb-6">The crowdfunding platform powered by Solana</p>
        <button
          onClick={signIn}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transform transition duration-200 hover:scale-105"
        >
          Sign In with Civic
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 p-8">
        <Header />

        {/* User Info */}
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg text-white">
          <div>
            <p className="text-lg font-medium">Welcome, {user.name || "FloFi"}!</p>
            {walletCreating ? (
              <p className="text-sm text-blue-400">Creating your wallet... Please wait</p>
            ) : error ? (
              <div>
                <p className="text-sm text-red-400">{error}</p>
                <button
                  onClick={async () => {
                    setWalletCreating(true);
                    try {
                      await userContext.createWallet();
                      setError(null);
                    } catch (e) {
                      setError("Failed to create wallet. Please try again.");
                    }
                    setWalletCreating(false);
                  }}
                  className="text-sm underline text-blue-400 hover:text-blue-300"
                >
                  Try again
                </button>
              </div>
            ) : userHasWallet(userContext) ? (
              <div>
                <p className="text-sm text-gray-300">
                  Wallet: <span className="text-blue-300">{userContext.solana.address.slice(0, 6)}...{userContext.solana.address.slice(-6)}</span>
                </p>
                {balance !== null ? (
                  <p className="text-sm text-gray-300">
                    Balance: <span className="text-green-400">{balance.toFixed(4)} SOL</span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Loading balance...</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Wallet status: Initializing...</p>
            )}
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Sign Out
          </button>
        </div>
        
        {userHasWallet(userContext) ? (
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
        ) : (
          <div className="flex items-center justify-center h-64 mt-8">
            <div className="text-center text-white">
              {walletCreating ? (
                <div>
                  <svg className="animate-spin h-8 w-8 mb-4 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-lg">Setting up your wallet...</p>
                  <p className="text-sm text-gray-400">This will just take a moment</p>
                </div>
              ) : error ? (
                <div>
                  <p className="text-red-400 mb-2">Unable to set up your wallet</p>
                  <p className="text-gray-400 mb-4">We need to create a wallet for you to use Fundrr</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg">Preparing your dashboard...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;