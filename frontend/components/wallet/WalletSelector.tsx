'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { isWalletInstalled } from '@/lib/wallet/real-wallet';
import { useEffect, useState } from 'react';

interface Wallet {
  id: string;
  name: string;
  logo: string;
  color: string;
}

interface WalletSelectorProps {
  selectedWallet?: string;
  onWalletSelect: (walletId: string) => void;
}

const AVAILABLE_WALLETS: Wallet[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    logo: '/wallet-logos/gemini.webp',
    color: 'bg-white',
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    logo: '/wallet-logos/MetaMask_Fox.svg.png',
    color: 'bg-white',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    logo: '/wallet-logos/walletconnect.png',
    color: 'bg-white',
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    logo: '/wallet-logos/coinbasewallet.png',
    color: 'bg-white',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    logo: '/wallet-logos/rainbow.avif',
    color: 'bg-white',
  },
  {
    id: 'phantom',
    name: 'Phantom',
    logo: '/wallet-logos/phantom.png',
    color: 'bg-white',
  },
];

export const WalletSelector = ({ selectedWallet, onWalletSelect }: WalletSelectorProps) => {
  const [installedWallets, setInstalledWallets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check which wallets are installed (client-side only)
    const installed: Record<string, boolean> = {};
    AVAILABLE_WALLETS.forEach((wallet) => {
      installed[wallet.id] = isWalletInstalled(wallet.id);
    });
    setInstalledWallets(installed);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {AVAILABLE_WALLETS.map((wallet) => {
        const isInstalled = installedWallets[wallet.id];
        const showWarning = isInstalled === false;

        return (
          <button
            key={wallet.id}
            onClick={() => onWalletSelect(wallet.id)}
            disabled={showWarning}
            className={clsx(
              'flex flex-col items-center gap-2 p-4 rounded-xl transition-all',
              'border',
              selectedWallet === wallet.id
                ? 'border-[#25ddf9] bg-cyan-50'
                : 'border-gray-300 bg-white hover:border-gray-400',
              'focus:outline-none focus:ring-1 focus:ring-[#25ddf9]',
              showWarning && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="w-20 h-20 flex items-center justify-center">
              <Image
                src={wallet.logo}
                alt={wallet.name}
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};
