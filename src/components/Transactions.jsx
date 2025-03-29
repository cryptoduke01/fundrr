import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal } from "lucide-react";

// Helper function to truncate wallet address
const truncateAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

const transactions = [
  {
    id: 1,
    type: "Campaign Contribution",
    amount: 1,
    currency: "SOL",
    address: "DRxPfqGfgvhxHqmqrAzDACHPg8GHKPfyxqEHJpBXkEsF",
    date: "Sep 08 2024",
    avatarFallback: "DR",
    color: "bg-purple-600",
  },
  {
    id: 2,
    type: "Campaign Creation",
    amount: 100,
    currency: "USDC",
    address: "2Y9SwqXXZJkoHzg9RhnAFK9PgwMvXwNNGxzV9YiJ4Qks",
    date: "Sep 07 2024",
    avatarFallback: "2Y",
    color: "bg-green-500",
  },
  {
    id: 3,
    type: "Funds Withdrawn",
    amount: 2.5,
    currency: "SOL",
    address: "7KBVqUEyGBkHYYu14vtEfRBLEVXvHoqXHuTJ6HbVUGuG",
    date: "Sep 06 2024",
    avatarFallback: "7K",
    color: "bg-blue-500",
  },
  {
    id: 4,
    type: "Campaign Contribution",
    amount: 500,
    currency: "USDC",
    address: "3ZPJ8SHxKGVkpJ3wHzqpxVzCBJHwEWqYNkH8YtPkP3Td",
    date: "Sep 05 2024",
    avatarFallback: "3Z",
    color: "bg-purple-600",
  }
];

const CurrencyLogo = ({ currency }) => {
  if (currency === "SOL") {
    return (
      <img
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MjYuMSA0NzMuMiI+PHN0eWxlPi5zdDB7ZmlsbDojZmZmfTwvc3R5bGU+PHBhdGggZD0iTTEzOS4zIDIwMi4xIDYuNiAzMzQuN2MtOC44IDguOS04LjggMjMuMiAwIDMyLjFsNzUuMiA3NS4yYzguOCA4LjkgMjMuMiA4LjkgMzIuMSAwbDEzMi43LTEzMi43YzQuNC00LjQgNC40LTExLjYgMC0xNmwtOTEuMy05MS4zYy00LjQtNC4zLTExLjUtNC4zLTE2LjEuMXoiIGNsYXNzPSJzdDAiLz48cGF0aCBkPSJNNDEyLjcgMzEuM2wtNzUuMi03NS4yYy04LjgtOC45LTIzLjItOC45LTMyLjEgMEwxNzIuNyA4OC44Yy00LjQgNC40LTQuNCAxMS42IDAgMTZsOTEuMyA5MS4zYzQuNCA0LjQgMTEuNiA0LjQgMTYgMGwxMzIuNy0xMzIuN2M4LjktOC45IDguOS0yMy4zIDAtMzIuMXoiIGNsYXNzPSJzdDAiLz48cGF0aCBkPSJNMTgyLjkgMjI4LjZsLTkxLjMtOTEuM2MtNC40LTQuNC0xMS42LTQuNC0xNiAwTDYuNiAyMDYuOWMtOC44IDguOS04LjggMjMuMiAwIDMyLjFsNzUuMiA3NS4yYzguOCA4LjkgMjMuMiA4LjkgMzIuMSAwbDEzMi43LTEzMi43YzQuNC00LjQgNC40LTExLjYgMC0xNmwtNDcuNi00Ny42Yy00LjQtNC40LTExLjYtNC40LTE2LjEuMXoiIGNsYXNzPSJzdDAiLz48L3N2Zz4="
        alt="SOL"
        className="h-4 w-4 inline-block mr-1"
      />
    );
  }
  if (currency === "USDC") {
    return (
      <img
        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjYiIGhlaWdodD0iMjYiIHZpZXdCb3g9IjAgMCAyNiAyNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjk5OTkgMjVDMTkuNjI3MyAyNSAyNSAxOS42Mjc0IDI1IDEzQzI1IDYuMzcyNTggMTkuNjI3MyAxIDEyLjk5OTkgMUM2LjM3MjU1IDEgMSA2LjM3MjU4IDEgMTNDMSAxOS42Mjc0IDYuMzcyNTUgMjUgMTIuOTk5OSAyNVoiIGZpbGw9IiMyNzc1Q0EiLz4KPHBhdGggZD0iTTEzIDIwLjA4MzNDMTYuOTA2MyAyMC4wODMzIDIwLjA4MzMgMTYuOTA2MyAyMC4wODMzIDEzQzIwLjA4MzMgOS4wOTM2NyAxNi45MDYzIDUuOTE2NjcgMTMgNS45MTY2N0M5LjA5MzY3IDUuOTE2NjcgNS45MTY2NyA5LjA5MzY3IDUuOTE2NjcgMTNDNS45MTY2NyAxNi45MDYzIDkuMDkzNjcgMjAuMDgzMyAxMyAyMC4wODMzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEzLjg1NDIgMTEuOTM3NUMxMy44NTQyIDExLjM3NSAxMy40Mzc1IDExLjA2MjUgMTIuNjY2NyAxMC45NTgzQzExLjg5NTggMTAuODU0MiAxMS4xMjUgMTAuNjQ1OCAxMC40NTgzIDEwLjMzMzNDOS43OTE2NyAxMC4wMjA4IDkuMjI5MTcgOS42MDQxNyA4Ljc3MDgzIDkuMDgzMzNDOC4zMTI1IDguNTYyNSA4LjA4MzMzIDcuOTM3NSA4LjA4MzMzIDcuMjA4MzNDOC4wODMzMyA2LjQ3OTE3IDguMzEyNSA1Ljg1NDE3IDguNzcwODMgNS4zMzMzM0M5LjIyOTE3IDQuODEyNSA5Ljc5MTY3IDQuNDM3NSAxMC40NTgzIDQuMjA4MzNWMi43MDgzM0gxMS43OTE3VjQuMjVDMTIuNDU4MyA0LjUyMDgzIDEyLjk3OTIgNC45Mzc1IDEzLjM1NDIgNS41QzEzLjcyOTIgNi4wNjI1IDEzLjkxNjcgNi43NSAxMy45MTY3IDcuNTYyNUgxMS43OTE3QzExLjc5MTcgNy4wNDE2NyAxMS42ODc1IDYuNjI1IDExLjQ3OTIgNi4zMTI1QzExLjI3MDggNiAxMC45NTgzIDUuODU0MTcgMTAuNTQxNyA1Ljg1NDE3QzEwLjEyNSA1Ljg1NDE3IDkuODEyNSA1Ljk3OTE3IDkuNjA0MTcgNi4yMjkxN0M5LjM5NTgzIDYuNDc5MTcgOS4yOTE2NyA2LjgxMjUgOS4yOTE2NyA3LjIyOTE3QzkuMjkxNjcgNy42MjUgOS4zOTU4MyA3Ljk1ODMzIDkuNjA0MTcgOC4yMjkxN0M5LjgxMjUgOC41IDEwLjE2NjcgOC43MDgzMyAxMC42NjY3IDguODU0MTdDMTEuMTY2NyA5IDExLjcwODMgOS4xNjY2NyAxMi4yOTE3IDkuMzU0MTdDMTIuODc1IDkuNTQxNjcgMTMuNDA0MiA5Ljc3MDgzIDEzLjg3NSAxMC4wNDE3QzE0LjM0NTggMTAuMzEyNSAxNC43MjkyIDEwLjY4NzUgMTUuMDIwOCAxMS4xNjY3QzE1LjMxMjUgMTEuNjQ1OCAxNS40NTgzIDEyLjI1IDE1LjQ1ODMgMTIuOTc5MkMxNS40NTgzIDEzLjcwODMgMTUuMjI5MiAxNC4zNTQyIDE0Ljc3MDggMTQuOTE2N0MxNC4zMTI1IDE1LjQ3OTIgMTMuNzA4MyAxNS44OTU4IDEyLjk1ODMgMTYuMTY2N1YxNy43MDgzSDExLjYyNVYxNi4xNjY3QzEwLjg1NDIgMTUuOTE2NyAxMC4yNSAxNS41IDkuODEyNSAxNC45MTY3QzkuMzc1IDE0LjMzMzMgOS4xNjY2NyAxMy41ODMzIDkuMTY2NjcgMTIuNjY2N0gxMS4yOTE3QzExLjI5MTcgMTMuMjI5MiAxMS40MTY3IDEzLjY4NzUgMTEuNjY2NyAxNC4wNDE3QzExLjkxNjcgMTQuMzk1OCAxMi4yNzA4IDE0LjU3MjkgMTIuNzI5MiAxNC41NzI5QzEzLjE4NzUgMTQuNTcyOSAxMy41NDE3IDE0LjQzNzUgMTMuNzkxNyAxNC4xNjY3QzE0LjA0MTcgMTMuODk1OCAxNC4xNjY3IDEzLjU0MTcgMTQuMTY2NyAxMy4xMDQyQzE0LjE2NjcgMTIuNjY2NyAxNC4wNjI1IDEyLjMxMjUgMTMuODU0MiAxMi4wNDE3QzEzLjg1NDIgMTEuOTc5MiAxMy44NTQyIDExLjk1ODMgMTMuODU0MiAxMS45Mzc1WiIgZmlsbD0iIzI3NzVDQSIvPgo8L3N2Zz4K"
        alt="USDC"
        className="h-4 w-4 inline-block mr-1"
      />
    );
  }
  return null;
};

const Transactions = () => {
  const containerVariants = {
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

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 300
      }
    })
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="rounded-2xl bg-gradient-to-br from-black/80 to-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold text-white"
        >
          Transactions
        </motion.h2>
        <motion.button
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <MoreHorizontal className="h-5 w-5" />
        </motion.button>
      </div>

      <div className="divide-y divide-slate-800">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            custom={index}
            variants={itemVariants}
            whileHover={{
              backgroundColor: 'rgba(30, 35, 48, 0.5)',
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-4 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`
                h-10 w-10 
                rounded-full 
                ${transaction.color} 
                flex items-center 
                justify-center
              `}
            >
              <span className="text-white font-semibold text-sm">
                {transaction.avatarFallback}
              </span>
            </motion.div>

            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-sm font-medium text-white"
                >
                  {transaction.type}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-sm font-medium text-green-500 flex items-center"
                >
                  <CurrencyLogo currency={transaction.currency} />
                  {transaction.amount} {transaction.currency}
                </motion.span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-xs text-slate-400 font-mono"
                >
                  {truncateAddress(transaction.address)}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-xs text-slate-400"
                >
                  {transaction.date}
                </motion.span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Transactions;