'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WalletSelector } from './WalletSelector';
import { useUI } from '@/contexts/UIContext';
import { useWallet } from '@/contexts/WalletContext';
import { useState, FormEvent, useEffect } from 'react';

export function WalletModal() {
  const { modals, closeModal, showNotification } = useUI();
  const {
    connect,
    setNickname,
    isConnecting,
    wallet,
    error: walletError,
    isOnWrongNetwork,
    switchToPolygon,
  } = useWallet();
  const [step, setStep] = useState<'onboarding' | 'network'>('onboarding');
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [nickname, setNicknameValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Display wallet errors
  useEffect(() => {
    if (walletError) {
      setError(walletError);
    }
  }, [walletError]);

  // Check for wrong network after connection and complete onboarding
  useEffect(() => {
    const completeOnboarding = async () => {
      if (!nickname.trim()) {
        return;
      }

      try {
        await setNickname(nickname);

        closeModal('wallet');
        showNotification({
          message: 'Successfully connected!',
          type: 'success',
        });

        resetModal();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to set nickname');
      }
    };

    if (wallet?.isConnected && isOnWrongNetwork && step === 'onboarding') {
      setStep('network');
    } else if (wallet?.isConnected && !isOnWrongNetwork && step === 'onboarding' && nickname.trim()) {
      // Connected successfully on correct network - complete onboarding
      completeOnboarding();
    }
  }, [wallet, isOnWrongNetwork, step, nickname, setNickname, closeModal, showNotification]);

  const handleWalletSelect = (walletId: string) => {
    setSelectedWallet(walletId);
    setError(null);
  };

  const handleContinue = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedWallet) {
      setError('Please select a wallet');
      return;
    }

    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Connect wallet
      await connect(selectedWallet);

      // Connection successful - useEffect will handle next steps (network check or complete onboarding)
    } catch (err) {
      // Error already set by wallet context
      console.error('Wallet connection error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNetworkSwitch = async () => {
    try {
      await switchToPolygon();
      // After network switch, save nickname and complete onboarding
      if (nickname.trim()) {
        await setNickname(nickname);
        closeModal('wallet');
        showNotification({
          message: 'Successfully connected!',
          type: 'success',
        });
        resetModal();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save nickname');
    }
  };

  const resetModal = () => {
    setStep('onboarding');
    setSelectedWallet('');
    setNicknameValue('');
    setError(null);
  };

  const handleClose = () => {
    closeModal('wallet');
    resetModal();
  };

  return (
    <Modal
      isOpen={modals.wallet}
      onClose={handleClose}
      title={step === 'onboarding' ? 'Connect your wallet' : 'Switch Network'}
      size="md"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {step === 'onboarding' && (
        <form onSubmit={handleContinue} className="flex flex-col gap-6">
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

          <WalletSelector selectedWallet={selectedWallet} onWalletSelect={handleWalletSelect} />

          <Button
            type="submit"
            disabled={!selectedWallet || !nickname.trim() || isSubmitting}
            loading={isSubmitting}
            fullWidth
            variant="black"
          >
            {isSubmitting ? 'Connecting...' : 'Continue'}
          </Button>
        </form>
      )}

      {step === 'network' && (
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              You're connected to the wrong network. Please switch to Polygon to continue.
            </p>
          </div>

          <Button
            onClick={handleNetworkSwitch}
            loading={isConnecting}
            disabled={isConnecting}
            fullWidth
            variant="black"
          >
            Switch to Polygon
          </Button>

          <p className="text-xs text-center text-gray-500">
            You can also manually switch networks in your wallet
          </p>
        </div>
      )}
    </Modal>
  );
}
