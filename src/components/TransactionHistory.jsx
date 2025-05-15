import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getTransactionHistory } from '../utils/programHelpers';
import { motion } from 'framer-motion';

// Simple date formatter function
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

const TransactionHistory = () => {
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get transaction history for the connected wallet
  useEffect(() => {
    if (!publicKey) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const history = getTransactionHistory(publicKey);
    setTransactions(history);
    setLoading(false);
  }, [publicKey]);

  // Helper to format transaction type for display
  const formatTransactionType = (type) => {
    switch (type) {
      case 'campaign_created':
        return 'Created Campaign';
      case 'contribution':
        return 'Contributed';
      case 'withdrawal':
        return 'Withdrew Funds';
      case 'refund':
        return 'Refunded';
      default:
        return 'Transaction';
    }
  };

  // Helper to get transaction icon
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'campaign_created':
        return '🚀';
      case 'contribution':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'refund':
        return '↩️';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-background rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="p-4 bg-background rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <p className="text-center text-gray-500">Connect your wallet to view transaction history</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-4 bg-background rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <p className="text-center text-gray-500">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-background rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Transaction History</h2>

      <div className="space-y-3">
        {transactions.map((tx, index) => (
          <motion.div
            key={tx.id}
            className="bg-card p-3 rounded-lg shadow-sm flex items-start gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="text-2xl">{getTransactionIcon(tx.type)}</div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{formatTransactionType(tx.type)}</h3>
                  {tx.type === 'campaign_created' && (
                    <p className="text-sm text-gray-600">{tx.data.name}</p>
                  )}
                  {tx.type === 'contribution' && (
                    <p className="text-sm text-gray-600">{tx.data.campaignName}</p>
                  )}
                  {tx.type === 'withdrawal' && (
                    <p className="text-sm text-gray-600">{tx.data.campaignName}</p>
                  )}
                </div>
                <div className="text-right">
                  {tx.type === 'contribution' && (
                    <p className="font-semibold text-primary">{tx.data.amount} SOL</p>
                  )}
                  {tx.type === 'withdrawal' && (
                    <p className="font-semibold text-primary">{tx.data.amountRaised} SOL</p>
                  )}
                  {tx.type === 'campaign_created' && (
                    <p className="font-semibold text-primary">-{tx.data.fee} SOL</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-1">
                <a
                  href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View on Explorer
                </a>
                <span className="text-xs text-gray-500">
                  {formatRelativeTime(tx.timestamp)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory; 