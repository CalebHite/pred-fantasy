'use client';

import Link from 'next/link';
import { WalletButton } from '@/components/wallet/WalletButton';
import { APP_NAME } from '@/lib/utils/constants';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🎲</span>
            <span className="text-xl font-bold text-gray-900">{APP_NAME}</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/create-game"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Create Game
            </Link>
            <Link
              href="/#join"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Join Game
            </Link>
          </nav>

          {/* Wallet Button */}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
