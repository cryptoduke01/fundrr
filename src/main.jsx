import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletProvider } from './contexts/WalletContext';
import App from './App';
import './index.css';

// Polyfills for Node.js built-in modules
import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Polyfill for process
window.process = {
  env: {},
  versions: {},
};

// Using devnet for development
const RPC_ENDPOINT = "https://api.devnet.solana.com";

// Initialize wallet adapters
const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new LedgerWalletAdapter(),
];

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </WalletProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);
