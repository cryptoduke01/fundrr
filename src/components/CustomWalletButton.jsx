import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const CustomWalletButton = () => {
  const { connected } = useWallet();

  // This component wraps the WalletMultiButton with custom styling
  return (
    <div className="custom-wallet-wrapper w-full">
      <style jsx>{`
        /* Custom styles for the wallet button */
        :global(.wallet-adapter-button) {
          width: 100%;
          height: auto;
          padding: 0.875rem;
          border-radius: 0.75rem;
          background: #7C3AED;
          font-size: 1rem;
          font-weight: 500;
          line-height: 1.5;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-center: center;
          color: white;
          border: none;
        }
        
        :global(.wallet-adapter-button:hover) {
          background: #6D28D9;
          transform: translateY(-1px);
        }
        
        :global(.wallet-adapter-button-trigger) {
          background: #7C3AED;
        }
        
        :global(.wallet-adapter-button:not([disabled]):focus-visible) {
          outline: 2px solid #7C3AED;
          outline-offset: 2px;
        }
        
        :global(.wallet-adapter-button[disabled]) {
          background: #7C3AED;
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        :global(.wallet-adapter-modal) {
          border-radius: 1rem;
          background: #0F1729;
          border: 1px solid #1E2943;
        }
        
        :global(.wallet-adapter-modal-wrapper) {
          background-color: transparent;
        }
        
        :global(.wallet-adapter-modal-title) {
          color: white;
          font-weight: 600;
        }
        
        :global(.wallet-adapter-modal-list) {
          margin: 0 !important;
        }

        :global(.wallet-adapter-modal-list .wallet-adapter-button) {
          border-radius: 0.75rem;
          margin: 0.5rem 0;
          background: #151C2E;
          border: 1px solid #1E2943;
          color: white;
        }

        :global(.wallet-adapter-modal-list .wallet-adapter-button:hover) {
          background: #1E2943;
          border-color: #3B82F6;
        }

        :global(.wallet-adapter-modal-list-more) {
          color: #3B82F6 !important;
          font-weight: 500;
        }

        :global(.wallet-adapter-modal-list-more:hover) {
          color: #60A5FA !important;
        }

        :global(.wallet-adapter-modal-button-close) {
          background: #151C2E !important;
          border: 1px solid #1E2943;
          border-radius: 0.75rem;
          transition: all 0.2s;
        }

        :global(.wallet-adapter-modal-button-close:hover) {
          background: #1E2943 !important;
          border-color: #3B82F6;
        }

        :global(.wallet-adapter-button-start-icon) {
          margin-right: 0.75rem;
        }
      `}</style>
      <WalletMultiButton />
    </div>
  );
};

export default CustomWalletButton;