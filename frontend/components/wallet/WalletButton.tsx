'use client';

import { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/contexts/WalletContext';
import { useUI } from '@/contexts/UIContext';
import { formatAddress } from '@/lib/utils/format';

export function WalletButton() {
  const { wallet, disconnect, error } = useWallet();
  const { openModal, showNotification } = useUI();

  // Display error notifications
  useEffect(() => {
    if (error) {
      showNotification({
        message: error,
        type: 'error',
      });
    }
  }, [error, showNotification]);

  const handleConnect = useCallback(() => {
    openModal('wallet');
  }, [openModal]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  if (!wallet || !wallet.isConnected) {
    return (
      <Button onClick={handleConnect} variant="outline-ghost" size="md">
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3" role="group" aria-label="Wallet connection">
      <div className="hidden sm:flex flex-col items-end" aria-label="Connected wallet information">
        {wallet.nickname && (
          <span className="text-sm font-medium text-gray-900" aria-label="Wallet nickname">
            {wallet.nickname}
          </span>
        )}
        <span className="text-xs text-gray-500" aria-label="Wallet address">
          {formatAddress(wallet.address)}
        </span>
      </div>
      <Button
        onClick={handleDisconnect}
        size="sm"
        variant="outline"
        aria-label={`Disconnect wallet ${wallet.nickname || formatAddress(wallet.address)}`}
      >
        Disconnect
      </Button>
    </div>
  );
}
