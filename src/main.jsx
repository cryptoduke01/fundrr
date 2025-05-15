import './polyfills';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

if (typeof global === 'undefined') {
  window.global = window;
}

if (typeof process === 'undefined') {
  window.process = { env: {} };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import App from './App';
import './index.css';
import { ProgramProvider } from './contexts/ProgramContext';

// Import wallet styles
import '@solana/wallet-adapter-react-ui/styles.css';

const Main = () => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = 'devnet';
  const endpoint = clusterApiUrl(network);

  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];

  return (
    <React.StrictMode>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <ProgramProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
            </ProgramProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
