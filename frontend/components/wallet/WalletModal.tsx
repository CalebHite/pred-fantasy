'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WalletSelector } from './WalletSelector';
import { useUI } from '@/contexts/UIContext';
import { useWallet } from '@/contexts/WalletContext';
import { useState, FormEvent } from 'react';

export function WalletModal() {
  const { modals, closeModal, showNotification } = useUI();
  const { connect, setNickname, isConnecting } = useWallet();
  const [step, setStep] = useState<'wallet' | 'nickname'>('wallet');
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [nickname, setNicknameValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWalletSelect = (walletId: string) => {
    setSelectedWallet(walletId);
    setError(null);
  };

  const handleWalletContinue = () => {
    if (!selectedWallet) {
      setError('Please select a wallet');
      return;
    }

    // Move to nickname step
    setStep('nickname');
  };

  const handleNicknameSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Connect wallet (mock)
      await connect();

      // Set nickname
      if (nickname.trim()) {
        await setNickname(nickname);
      }

      // Close modal
      closeModal('wallet');

      showNotification({
        message: 'Successfully connected!',
        type: 'success',
      });

      // Reset state
      setStep('wallet');
      setSelectedWallet('');
      setNicknameValue('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    closeModal('wallet');
    // Reset state
    setStep('wallet');
    setSelectedWallet('');
    setNicknameValue('');
    setError(null);
  };

  return (
    <Modal
      isOpen={modals.wallet}
      onClose={handleClose}
      title="Connect your wallet"
      size="md"
    >
      {step === 'wallet' ? (
        <div className="flex flex-col gap-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Wallet Selection */}
          <WalletSelector
            selectedWallet={selectedWallet}
            onWalletSelect={handleWalletSelect}
          />

          {/* Continue Button */}
          <Button
            onClick={handleWalletContinue}
            disabled={!selectedWallet}
            fullWidth
            variant="black"
          >
            Continue
          </Button>

          <p className="text-xs text-center text-gray-500">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      ) : (
        <form onSubmit={handleNicknameSubmit} className="flex flex-col gap-6">
          <p className="text-sm font-light text-gray-600">
            Choose a nickname that other players will see in the game.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Input
            label=""
            value={nickname}
            onChange={(e) => setNicknameValue(e.target.value)}
            placeholder="Enter nickname"
            required
            maxLength={20}
            fullWidth
            autoFocus
            className="text-lg"
          />

          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting || !nickname.trim()}
            fullWidth
            variant="black"
          >
            Continue
          </Button>
        </form>
      )}
    </Modal>
  );
}
