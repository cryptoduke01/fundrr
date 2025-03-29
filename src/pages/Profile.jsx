import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
// import Header from '../components/Header';

const Profile = () => {
  const { publicKey, connected } = useWallet();
  const navigate = useNavigate();

  if (!connected) {
    navigate('/');
    return null;
  }

  return (
    <div className="flex-1">
      {/* <Header /> */}

      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {publicKey.toString().slice(0, 2)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Profile</h2>
              <p className="text-gray-400">{publicKey.toString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Campaigns Created</h3>
              <p className="text-3xl font-bold text-purple-500">0</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Total Contributions</h3>
              <p className="text-3xl font-bold text-green-500">0 SOL</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 