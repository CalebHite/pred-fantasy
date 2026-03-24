'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useUI } from '@/contexts/UIContext';
import { useWallet } from '@/contexts/WalletContext';
import { useState } from 'react';

export function WalletModal() {
  const { modals, closeModal, openModal } = useUI();
  const { connect, isConnecting } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    try {
      await connect();
      closeModal('wallet');
      // Open nickname modal after successful connection
      openModal('nickname');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  return (
    <Modal
      isOpen={modals.wallet}
      onClose={() => closeModal('wallet')}
      title="Connect Wallet"
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          Connect your wallet to create or join prediction market games.
        </p>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-2xl">ℹ️</div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Development Mode
              </h3>
              <p className="text-xs text-blue-700">
                This will generate a mock wallet address for development purposes.
                Real wallet integration coming soon!
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleConnect}
          loading={isConnecting}
          disabled={isConnecting}
          fullWidth
        >
          {isConnecting ? 'Connecting...' : 'Connect Mock Wallet'}
        </Button>

        <p className="text-xs text-center text-gray-500">
          By connecting, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </Modal>
  );
}
