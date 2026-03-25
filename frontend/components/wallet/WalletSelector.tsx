'use client';

import Image from 'next/image';
import clsx from 'clsx';

interface Wallet {
  id: string;
  name: string;
  icon: string;
}

interface WalletSelectorProps {
  selectedWallet?: string;
  onWalletSelect: (walletId: string) => void;
}

const AVAILABLE_WALLETS: Wallet[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊', // Placeholder - can be replaced with actual icon
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    icon: '🔷',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
  },
];

export const WalletSelector = ({ selectedWallet, onWalletSelect }: WalletSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {AVAILABLE_WALLETS.map((wallet) => (
        <button
          key={wallet.id}
          onClick={() => onWalletSelect(wallet.id)}
          className={clsx(
            'flex flex-col items-center gap-3 p-6 rounded-2xl transition-all',
            'border-2',
            selectedWallet === wallet.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300',
            'focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
        >
          {/* Icon */}
          <div
            className={clsx(
              'w-16 h-16 rounded-full flex items-center justify-center text-3xl',
              selectedWallet === wallet.id ? 'bg-blue-100' : 'bg-gray-100'
            )}
          >
            {wallet.icon}
          </div>

          {/* Name */}
          <span
            className={clsx(
              'text-sm font-light text-center',
              selectedWallet === wallet.id ? 'text-blue-700' : 'text-gray-700'
            )}
          >
            {wallet.name}
          </span>
        </button>
      ))}
    </div>
  );
};
