import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Sun, Globe, Shield, Wallet } from 'lucide-react';

const Settings = () => {
  const settingSections = [
    {
      title: 'Appearance',
      icon: Sun,
      options: [
        { label: 'Theme', value: 'Dark', type: 'select', options: ['Light', 'Dark', 'System'] },
        { label: 'Reduce Animations', type: 'toggle', value: false },
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      options: [
        { label: 'Campaign Updates', type: 'toggle', value: true },
        { label: 'New Contributions', type: 'toggle', value: true },
        { label: 'Campaign Milestones', type: 'toggle', value: true },
      ]
    },
    {
      title: 'Language & Region',
      icon: Globe,
      options: [
        { label: 'Language', value: 'English', type: 'select', options: ['English', 'Spanish', 'French'] },
        { label: 'Time Zone', value: 'UTC-5', type: 'select', options: ['UTC-8', 'UTC-5', 'UTC+0', 'UTC+1'] },
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      options: [
        { label: 'Transaction Confirmations', type: 'toggle', value: true },
        { label: 'Auto-lock Timer', value: '5 minutes', type: 'select', options: ['1 minute', '5 minutes', '15 minutes', '30 minutes'] },
      ]
    },
    {
      title: 'Wallet',
      icon: Wallet,
      options: [
        { label: 'Default Gas Settings', type: 'select', value: 'Normal', options: ['Low', 'Normal', 'High'] },
        { label: 'Show Test Networks', type: 'toggle', value: false },
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
          Settings
        </h1>
        <p className="text-gray-400 mt-2">Customize your experience and preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {settingSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-4">
                {section.options.map((option) => (
                  <div key={option.label} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800/70 transition-colors">
                    <span className="text-gray-300">{option.label}</span>
                    {option.type === 'toggle' ? (
                      <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${option.value ? 'bg-purple-500' : 'bg-gray-700'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${option.value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    ) : (
                      <select className="bg-gray-700 text-gray-300 rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-purple-500/50">
                        {option.options.map((opt) => (
                          <option key={opt} selected={opt === option.value}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Settings; 