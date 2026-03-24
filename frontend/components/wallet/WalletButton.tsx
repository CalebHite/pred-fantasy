'use client';

import { Button } from '@/components/ui/Button';
import { useWallet } from '@/contexts/WalletContext';
import { useUI } from '@/contexts/UIContext';
import { formatAddress } from '@/lib/utils/format';

export function WalletButton() {
  const { wallet, disconnect } = useWallet();
  const { openModal } = useUI();

  if (!wallet?.isConnected) {
    return (
      <Button onClick={() => openModal('wallet')} size="sm">
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex flex-col items-end">
        {wallet.nickname && (
          <span className="text-sm font-medium text-gray-900">{wallet.nickname}</span>
        )}
        <span className="text-xs text-gray-500">{formatAddress(wallet.address)}</span>
      </div>
      <Button onClick={disconnect} size="sm" variant="outline">
        Disconnect
      </Button>
    </div>
  );
}
