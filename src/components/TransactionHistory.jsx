import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

const TransactionHistory = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!publicKey) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch recent transactions for the wallet
        const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 20 });
        
        // Fetch transaction details
        const txDetails = await Promise.all(
          signatures.map(async (sig) => {
            try {
              const tx = await connection.getTransaction(sig.signature, {
                maxSupportedTransactionVersion: 0
              });
              return {
                signature: sig.signature,
                timestamp: new Date(sig.blockTime * 1000),
                status: sig.err ? 'Failed' : 'Success',
                fee: tx?.meta?.fee || 0,
              };
            } catch (error) {
              return {
                signature: sig.signature,
                timestamp: new Date(sig.blockTime * 1000),
                status: 'Unknown',
                fee: 0,
              };
            }
          })
        );

        setTransactions(txDetails);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [publicKey, connection]);

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h2>
        <div className="flex justify-center items-center p-4">
          <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h2>
        <p className="text-center text-gray-600 dark:text-gray-400">Connect your wallet to view transaction history</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h2>
        <p className="text-center text-gray-600 dark:text-gray-400">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h2>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.signature}
            className="bg-gray-50 dark:bg-[#0a0a0a] p-4 rounded-lg border border-gray-200 dark:border-gray-800"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    tx.status === 'Success'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {tx.status}
                  </span>
                </div>
                <a
                  href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white break-all"
                >
                  {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                </a>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {formatRelativeTime(tx.timestamp)}
                </p>
                {tx.fee > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Fee: {(tx.fee / 1_000_000_000).toFixed(9)} SOL
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;
