'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { isWalletInstalled } from '@/lib/wallet/real-wallet';
import { useEffect, useState } from 'react';

interface Wallet {
  id: string;
  name: string;
  logo: string;
}

interface WalletSelectorProps {
  selectedWallet?: string;
  onWalletSelect: (walletId: string) => void;
  hasError?: boolean;
}

const AVAILABLE_WALLETS: Wallet[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    logo: '/wallet-logos/gemini.webp',
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    logo: '/wallet-logos/MetaMask_Fox.svg.png',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    logo: '/wallet-logos/walletconnect.png',
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    logo: '/wallet-logos/coinbasewallet.png',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    logo: '/wallet-logos/rainbow.avif',
  },
  {
    id: 'phantom',
    name: 'Phantom',
    logo: '/wallet-logos/phantom.png',
  },
];

export const WalletSelector = ({ selectedWallet, onWalletSelect, hasError }: WalletSelectorProps) => {
  const [installedWallets, setInstalledWallets] = useState<Record<string, boolean>>({});
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check which wallets are installed (client-side only)
    const installed: Record<string, boolean> = {};
    AVAILABLE_WALLETS.forEach((wallet) => {
      installed[wallet.id] = isWalletInstalled(wallet.id);
    });
    setInstalledWallets(installed);
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {AVAILABLE_WALLETS.map((wallet) => (
          <div
            key={wallet.id}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-300 bg-white animate-pulse"
          >
            <div className="w-20 h-20 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <fieldset className={clsx(
      'border-2 rounded-xl p-4',
      hasError ? 'border-red-500' : 'border-transparent'
    )}>
      <legend className="sr-only">Select a wallet provider</legend>
      <div className="grid grid-cols-3 gap-4" role="radiogroup">
        {AVAILABLE_WALLETS.map((wallet) => {
          const isInstalled = installedWallets[wallet.id];
          const showWarning = isInstalled === false;

          return (
            <div key={wallet.id} className="relative">
              {showWarning && (
                <span id={`${wallet.id}-warning`} className="sr-only">
                  Not installed
                </span>
              )}
              <button
                onClick={() => onWalletSelect(wallet.id)}
                disabled={showWarning}
                aria-label={`Select ${wallet.name} wallet`}
                aria-checked={selectedWallet === wallet.id}
                aria-describedby={showWarning ? `${wallet.id}-warning` : undefined}
                role="radio"
                className={clsx(
                  'flex flex-col items-center p-4 rounded-xl transition-all w-full',
                  'focus:outline-none',
                  selectedWallet === wallet.id ? 'opacity-100' : 'opacity-50',
                  showWarning && 'cursor-not-allowed'
                )}
              >
                <div className="w-20 h-20 flex items-center justify-center relative">
                  <Image
                    src={wallet.logo}
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};
