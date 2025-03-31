import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, X, ExternalLink, Download } from "lucide-react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Transactions = () => {
  const { publicKey } = useWallet();
  const [selectedTx, setSelectedTx] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Dummy transactions data
  const dummyTransactions = [
    {
      signature: '5xhtuqrxmqE1wQkUfZkv8PkD3qZ9kqFhJJGKvZNzc123',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      type: "Contribution Made",
      amount: 2.5,
      campaignTitle: "Save the Ocean Campaign",
      fee: 0.000005,
    },
    {
      signature: '3yhtuqrxmqE1wQkUfZkv8PkD3qZ9kqFhJJGKvZNzc456',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      type: "Contribution Received",
      amount: 5.0,
      campaignTitle: "Education for All",
      fee: 0.000005,
    },
    {
      signature: '7yhtuqrxmqE1wQkUfZkv8PkD3qZ9kqFhJJGKvZNzc789',
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      type: "Contribution Made",
      amount: 3.2,
      campaignTitle: "Green Earth Initiative",
      fee: 0.000005,
    }
  ];

  const handleDownload = () => {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Crowdfunding Activity', 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(127, 140, 141);
    doc.text(`Wallet: ${publicKey?.toString()}`, 20, 30);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 40);

    // Prepare table data
    const tableData = dummyTransactions.map(tx => [
      tx.timestamp.toLocaleString(),
      tx.type,
      tx.campaignTitle,
      `${tx.amount.toFixed(2)} SOL`,
      tx.type.includes('Received') ? 'Credit' : 'Debit'
    ]);

    // Add table
    doc.autoTable({
      startY: 50,
      head: [['Date', 'Type', 'Campaign', 'Amount', 'Status']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [128, 90, 213],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    // Save the PDF
    doc.save('crowdfunding-activity.pdf');
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-black/80 to-slate-900/80 p-6 border border-slate-800 mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Crowdfunding Activity</h2>
        <button
          onClick={handleDownload}
          className="text-blue-500 hover:text-blue-400 transition-colors cursor-pointer"
          title="Download activity history"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {dummyTransactions.map((tx, index) => (
          <motion.div
            key={tx.signature}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors cursor-pointer"
            onClick={() => {
              setSelectedTx(tx);
              setIsModalOpen(true);
            }}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${tx.type.includes('Received') ? 'bg-green-500/20' : 'bg-purple-500/20'}`}>
                {tx.type.includes('Received') ? (
                  <Plus className="w-4 h-4 text-green-500" />
                ) : (
                  <Minus className="w-4 h-4 text-purple-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{tx.type}</p>
                <p className="text-xs text-slate-400">
                  {tx.campaignTitle}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${tx.type.includes('Received') ? 'text-green-500' : 'text-purple-500'}`}>
                {tx.type.includes('Received') ? '+' : '-'}{tx.amount.toFixed(2)} SOL
              </p>
              <p className="text-xs text-slate-400">
                {tx.timestamp.toLocaleString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && selectedTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-xl p-6 max-w-lg w-full mx-4 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Transaction Hash</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-mono text-sm break-all">{selectedTx.signature}</p>
                    <a
                      href={`https://explorer.solana.com/tx/${selectedTx.signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type</span>
                    <span className="text-white">{selectedTx.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Campaign</span>
                    <span className="text-white">{selectedTx.campaignTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount</span>
                    <span className={selectedTx.type.includes('Received') ? 'text-green-500' : 'text-purple-500'}>
                      {selectedTx.type.includes('Received') ? '+' : '-'}{selectedTx.amount.toFixed(2)} SOL
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fee</span>
                    <span className="text-white">{selectedTx.fee.toFixed(6)} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timestamp</span>
                    <span className="text-white">{selectedTx.timestamp.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;