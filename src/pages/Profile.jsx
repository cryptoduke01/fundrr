import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import solanaLogoMark from '../assets/solanaLogoMark.png';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { fetchUserCampaigns } from '../utils/programHelpers';
import { useProgram } from '../contexts/ProgramContext';
import TransactionHistory from '../components/TransactionHistory';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { CopyIcon, ExternalLinkIcon } from "lucide-react";
import CampaignCard from '../components/CampaignCard';

// import Header from '../components/Header';

const Profile = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();
  const program = useProgram();
  const [balance, setBalance] = useState(0);
  const [solPrice, setSolPrice] = useState(null);
  const [copied, setCopied] = useState(false);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    if (!connected) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      if (!publicKey || !program) {
        setLoading(false);
        return;
      }

      try {
        // Get user's SOL balance
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);

        // Get user's campaigns
        const campaigns = await fetchUserCampaigns(program, publicKey);
        setUserCampaigns(campaigns);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSolPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        setSolPrice(data.solana.usd);
      } catch (error) {
        console.error("Error fetching SOL price:", error);
      }
    };

    fetchData();
    fetchSolPrice();

    const balanceInterval = setInterval(fetchData, 30000);
    const priceInterval = setInterval(fetchSolPrice, 60000);

    return () => {
      clearInterval(balanceInterval);
      clearInterval(priceInterval);
    };
  }, [publicKey, connected, connection, navigate, program]);

  const handleCopyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  if (!connected) {
    navigate('/');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${publicKey}`} alt="Avatar" />
              <AvatarFallback>
                {publicKey?.toString().slice(0, 2) || 'NA'}
              </AvatarFallback>
            </Avatar>
            <CardTitle>My Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Wallet Address</div>
                <div className="flex items-center justify-between bg-muted p-2 rounded">
                  <span className="text-sm font-mono">
                    {shortenAddress(publicKey?.toString())}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleCopyAddress}>
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon"
                      onClick={() => window.open(`https://explorer.solana.com/address/${publicKey}?cluster=devnet`, '_blank')}>
                      <ExternalLinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Balance</div>
                <div className="text-2xl font-bold">{balance.toFixed(4)} SOL</div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Network</div>
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  <span>Solana Devnet</span>
                </div>
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => window.open('https://solfaucet.com/', '_blank')}
              >
                Get Devnet SOL
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <div className="md:col-span-2">
          <Tabs defaultValue="campaigns">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="campaigns" className="flex-1">My Campaigns</TabsTrigger>
              <TabsTrigger value="transactions" className="flex-1">Transaction History</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns">
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : userCampaigns.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {userCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.publicKey.toString()} campaign={campaign} />
                  ))}
                </div>
              ) : (
                <div className="text-center p-12 bg-background rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No Campaigns Yet</h3>
                  <p className="text-gray-500 mb-6">You haven't created any campaigns yet.</p>
                  <Button onClick={() => window.location.href = '/create'}>Create a Campaign</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile; 