'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUI } from '@/contexts/UIContext';
import { useWallet } from '@/contexts/WalletContext';
import { useState, FormEvent } from 'react';

export function NicknameSetup() {
  const { modals, closeModal, showNotification } = useUI();
  const { setNickname } = useWallet();
  const [nickname, setNicknameValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await setNickname(nickname);
      closeModal('nickname');
      showNotification({
        message: 'Nickname set successfully!',
        type: 'success',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set nickname');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    closeModal('nickname');
  };

  return (
    <Modal
      isOpen={modals.nickname}
      onClose={handleSkip}
      title="Set Your Nickname"
      size="sm"
      closeOnOverlayClick={false}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          Choose a nickname that other players will see in the game.
        </p>

        <Input
          label="Nickname"
          value={nickname}
          onChange={(e) => setNicknameValue(e.target.value)}
          placeholder="Enter your nickname"
          required
          maxLength={20}
          error={error || undefined}
          fullWidth
          autoFocus
        />

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={handleSkip}
            variant="ghost"
            fullWidth
            disabled={isSubmitting}
          >
            Skip for Now
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting || !nickname.trim()}
            fullWidth
          >
            Save Nickname
          </Button>
        </div>
      </form>
    </Modal>
  );
}
