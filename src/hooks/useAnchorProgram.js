import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import idl from '../idl/fundrr.json';

const programID = new PublicKey('GAQ7YMvLb3wxMbTHX5cpUQM5wk5m4h9LG4RakBqJjR5P');

export const useAnchorProgram = () => {
  const { connection } = useConnection();
  const { wallet } = useWallet();
  const [program, setProgram] = useState(null);

  useEffect(() => {
    if (!wallet) return;

    try {
      const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
      );

      const program = new Program(idl, programID, provider);
      setProgram(program);
    } catch (error) {
      console.error('Error initializing Anchor program:', error);
    }
  }, [connection, wallet]);

  return { program };
}; 