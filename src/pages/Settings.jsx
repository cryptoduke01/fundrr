import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Sun, Globe, Shield, Wallet, Check } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AppSettingsContext } from '../App';

const Settings = () => {
  const { disconnect } = useWallet();
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    reduceAnimations,
    setReduceAnimations,
    autoLockTimer,
    setAutoLockTimer
  } = useContext(AppSettingsContext);

  const [savedMessage, setSavedMessage] = React.useState(false);
  const [notifications, setNotifications] = React.useState({
    campaignUpdates: true,
    newContributions: true,
    campaignMilestones: true
  });
  const [security, setSecurity] = React.useState({
    transactionConfirmations: true
  });
  const [wallet, setWallet] = React.useState({
    defaultGasSettings: 'Normal',
    showTestNetworks: false
  });
  const [timeZone, setTimeZone] = React.useState('UTC-5');

  const handleToggle = (section, option) => {
    if (section === 'Appearance') {
      if (option === 'Reduce Animations') {
        setReduceAnimations(!reduceAnimations);
      }
    } else if (section === 'Notifications') {
      setNotifications({
        ...notifications,
        [option.toLowerCase().replace(' ', '')]: !notifications[option.toLowerCase().replace(' ', '')]
      });
    } else if (section === 'Security') {
      setSecurity({
        ...security,
        [option.toLowerCase().replace(' ', '')]: !security[option.toLowerCase().replace(' ', '')]
      });
    } else if (section === 'Wallet') {
      setWallet({
        ...wallet,
        [option.toLowerCase().replace(' ', '')]: !wallet[option.toLowerCase().replace(' ', '')]
      });
    }

    showSavedMessage();
  };

  const handleSelectChange = (section, option, value) => {
    if (section === 'Appearance' && option === 'Theme') {
      setTheme(value);
    } else if (section === 'Language & Region') {
      if (option === 'Language') {
        setLanguage(value);
      } else if (option === 'Time Zone') {
        setTimeZone(value);
      }
    } else if (section === 'Security' && option === 'Auto-lock Timer') {
      const minutes = parseInt(value);
      setAutoLockTimer(minutes);
    } else if (section === 'Wallet' && option === 'Default Gas Settings') {
      setWallet({
        ...wallet,
        defaultGasSettings: value
      });
    }

    showSavedMessage();
  };

  const showSavedMessage = () => {
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
    }, 2000);
  };

  const settingSections = [
    {
      title: 'Appearance',
      icon: theme === 'Dark' ? Moon : Sun,
      options: [
        {
          label: 'Theme',
          value: theme,
          type: 'select',
          options: ['Light', 'Dark', 'System'],
          onChange: (value) => handleSelectChange('Appearance', 'Theme', value)
        },
        {
          label: 'Reduce Animations',
          type: 'toggle',
          value: reduceAnimations,
          onChange: () => handleToggle('Appearance', 'Reduce Animations')
        },
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      options: [
        {
          label: 'Campaign Updates',
          type: 'toggle',
          value: notifications.campaignUpdates,
          onChange: () => handleToggle('Notifications', 'Campaign Updates')
        },
        {
          label: 'New Contributions',
          type: 'toggle',
          value: notifications.newContributions,
          onChange: () => handleToggle('Notifications', 'New Contributions')
        },
        {
          label: 'Campaign Milestones',
          type: 'toggle',
          value: notifications.campaignMilestones,
          onChange: () => handleToggle('Notifications', 'Campaign Milestones')
        },
      ]
    },
    {
      title: 'Language & Region',
      icon: Globe,
      options: [
        {
          label: 'Language',
          value: language,
          type: 'select',
          options: ['English', 'Spanish', 'French', 'German', 'Chinese'],
          onChange: (value) => handleSelectChange('Language & Region', 'Language', value)
        },
        {
          label: 'Time Zone',
          value: timeZone,
          type: 'select',
          options: ['UTC-8', 'UTC-5', 'UTC+0', 'UTC+1', 'UTC+8'],
          onChange: (value) => handleSelectChange('Language & Region', 'Time Zone', value)
        },
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      options: [
        {
          label: 'Transaction Confirmations',
          type: 'toggle',
          value: security.transactionConfirmations,
          onChange: () => handleToggle('Security', 'Transaction Confirmations')
        },
        {
          label: 'Auto-lock Timer',
          value: `${autoLockTimer} minutes`,
          type: 'select',
          options: ['1 minute', '5 minutes', '10 minutes', '15 minutes', '30 minutes'],
          onChange: (value) => handleSelectChange('Security', 'Auto-lock Timer', parseInt(value.split(' ')[0]))
        },
      ]
    },
    {
      title: 'Wallet',
      icon: Wallet,
      options: [
        {
          label: 'Default Gas Settings',
          type: 'select',
          value: wallet.defaultGasSettings,
          options: ['Low', 'Normal', 'High'],
          onChange: (value) => handleSelectChange('Wallet', 'Default Gas Settings', value)
        },
        {
          label: 'Show Test Networks',
          type: 'toggle',
          value: wallet.showTestNetworks,
          onChange: () => handleToggle('Wallet', 'Show Test Networks')
        },
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

      {savedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-2"
        >
          <Check className="w-5 h-5 text-green-500" />
          <span className="text-green-500">Settings saved successfully</span>
        </motion.div>
      )}

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
                        onClick={option.onChange}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${option.value ? 'bg-purple-500' : 'bg-gray-700'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${option.value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    ) : (
                      <select
                        className="bg-gray-700 text-gray-300 rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-purple-500/50"
                        value={option.value}
                        onChange={(e) => option.onChange(e.target.value)}
                      >
                        {option.options.map((opt) => (
                          <option key={opt} value={opt}>
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