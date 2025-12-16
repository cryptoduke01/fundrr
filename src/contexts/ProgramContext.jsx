import React, { createContext, useContext, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@project-serum/anchor';
import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import idl from '../idl/fundrr.json';

// Program ID from the deployed contract
const PROGRAM_ID = new PublicKey('2YmiPygdaL7MfnB4otFDchBFd2gdEQnNeeYd4LueJFvu');

// Create the context
const ProgramContext = createContext();

export function ProgramProvider({ children }) {
  const { connection } = useConnection();
  const wallet = useWallet();

  // Initialize the program with real devnet connection
  const program = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.connected) return null;

    try {
      const provider = new anchor.AnchorProvider(
        connection,
        wallet,
        { 
          preflightCommitment: 'confirmed',
          commitment: 'confirmed'
        }
      );

      // Create and return the real program
      const program = new anchor.Program(idl, PROGRAM_ID, provider);
      return program;
    } catch (error) {
      console.error('Error initializing program:', error);
      return null;
    }
  }, [wallet.publicKey?.toString(), wallet.connected, connection]);

  return (
    <ProgramContext.Provider value={{ program }}>
      {children}
    </ProgramContext.Provider>
  );
}

export function useProgram() {
  const context = useContext(ProgramContext);
  if (!context) {
    throw new Error('useProgram must be used within a ProgramProvider');
  }
  return context.program;
} 