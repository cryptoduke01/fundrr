import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { CivicAuthProvider } from "@civic/auth-web3/react";
import Dashboard from './pages/dashboard';

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

// Replace with your actual Client ID from Civic Auth dashboard
const CLIENT_ID = "e2ea7a8a-427d-4f86-bfb7-a63d59fa9a67";
// Using devnet for development
const RPC_ENDPOINT = "https://api.devnet.solana.com";

const App = () => {
  // Connection to use throughout the app
  const endpoint = useMemo(() => RPC_ENDPOINT, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <CivicAuthProvider 
            clientId={CLIENT_ID}
            // Add optional configuration here if needed
            onSignIn={(error) => {
              if (error) {
                console.error("Sign in error:", error);
              } else {
                console.log("Successfully signed in");
              }
            }}
          >
            <Dashboard />
          </CivicAuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;