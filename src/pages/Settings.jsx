import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
// import Header from '../components/Header';

const Settings = () => {
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
          <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

          <div className="space-y-6">
            <div className="border-b border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Email Notifications</p>
                    <p className="text-sm text-gray-400">Receive updates about your campaigns</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Campaign Updates</p>
                    <p className="text-sm text-gray-400">Get notified about campaign milestones</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Display</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Theme</label>
                  <select className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
              <div className="space-y-4">
                <button
                  onClick={() => {/* TODO: Implement disconnect */ }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 