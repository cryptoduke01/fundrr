import React, { createContext, useContext, useState } from 'react';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [walletModalVisible, setWalletModalVisible] = useState(false);

  const value = {
    walletModalVisible,
    setWalletModalVisible,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
} 