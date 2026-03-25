'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { UserProfile } from '@/components/game/UserProfile';
import { WalletButton } from '@/components/wallet/WalletButton';
import { useWallet } from '@/contexts/WalletContext';
import { useUI } from '@/contexts/UIContext';
import { APP_NAME } from '@/lib/utils/constants';

export function Header() {
  const { wallet } = useWallet();
  const { openModal } = useUI();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering wallet state on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleProfileClick = () => {
    // Could open a profile menu/modal in the future
    console.log('Profile clicked');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-5">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image
              src="/icons/swords.svg"
              alt={APP_NAME}
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </Link>

          {/* User Profile or Connect Button */}
          <div suppressHydrationWarning>
            {mounted && wallet?.isConnected && wallet.address ? (
              <div className="bg-[#F7F7F7] rounded-[20px] pl-2 pr-32 py-1">
                <UserProfile
                  nickname={wallet.nickname}
                  address={wallet.address}
                  onClick={handleProfileClick}
                />
              </div>
            ) : (
              <WalletButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
