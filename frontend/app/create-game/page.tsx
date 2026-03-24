'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { CategoryCarousel } from '@/components/categories/CategoryCarousel';
import { useWallet } from '@/contexts/WalletContext';
import { useGame } from '@/contexts/GameContext';
import { useUI } from '@/contexts/UIContext';
import { getActiveCategories } from '@/data/mock-categories';
import { GameConfig } from '@/types';
import { MIN_CATEGORIES_REQUIRED, DEFAULT_BUY_IN } from '@/lib/utils/constants';
import {
  validateBuyIn,
  validateMaxParticipants,
  validateResolutionTime,
} from '@/lib/utils/validation';

export default function CreateGamePage() {
  const router = useRouter();
  const { wallet } = useWallet();
  const { createGame, isLoading } = useGame();
  const { showNotification, openModal } = useUI();

  const [buyInAmount, setBuyInAmount] = useState('10');
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [resolutionDays, setResolutionDays] = useState('7');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = getActiveCategories();

  // Redirect if not connected
  useEffect(() => {
    if (!wallet?.isConnected) {
      openModal('wallet');
      router.push('/');
    }
  }, [wallet, router, openModal]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate buy-in
    const buyInValidation = validateBuyIn(parseFloat(buyInAmount));
    if (!buyInValidation.valid) {
      newErrors.buyInAmount = buyInValidation.error!;
    }

    // Validate max participants
    const maxParticipantsNum = parseInt(maxParticipants);
    const maxParticipantsValidation = validateMaxParticipants(maxParticipantsNum);
    if (!maxParticipantsValidation.valid) {
      newErrors.maxParticipants = maxParticipantsValidation.error!;
    }

    // Validate resolution time
    const resolutionTime = new Date(Date.now() + parseInt(resolutionDays) * 24 * 60 * 60 * 1000);
    const resolutionValidation = validateResolutionTime(resolutionTime);
    if (!resolutionValidation.valid) {
      newErrors.resolutionDays = resolutionValidation.error!;
    }

    // Validate categories
    if (selectedCategories.length < MIN_CATEGORIES_REQUIRED) {
      newErrors.categories = `Please select at least ${MIN_CATEGORIES_REQUIRED} categories`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification({
        message: 'Please fix the errors before creating the game',
        type: 'error',
      });
      return;
    }

    try {
      const config: GameConfig = {
        buyInAmount: parseFloat(buyInAmount),
        categories: selectedCategories,
        maxParticipants: parseInt(maxParticipants),
        resolutionTime: new Date(Date.now() + parseInt(resolutionDays) * 24 * 60 * 60 * 1000),
      };

      const game = await createGame(config);

      showNotification({
        message: 'Game created successfully!',
        type: 'success',
      });

      router.push(`/game/${game.id}`);
    } catch (error) {
      showNotification({
        message: error instanceof Error ? error.message : 'Failed to create game',
        type: 'error',
      });
    }
  };

  if (!wallet?.isConnected) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Game</h1>
        <p className="text-gray-600">
          Configure your game settings and select prediction categories
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Game Settings */}
        <Card padding="lg">
          <h2 className="text-xl font-semibold mb-4">Game Settings</h2>

          <div className="space-y-4">
            <Input
              label="Buy-in Amount ($)"
              type="number"
              step="1"
              min="1"
              value={buyInAmount}
              onChange={(e) => setBuyInAmount(e.target.value)}
              error={errors.buyInAmount}
              helperText="Amount each player must stake to join"
              required
              fullWidth
            />

            <Input
              label="Max Participants"
              type="number"
              min="2"
              max="100"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              error={errors.maxParticipants}
              helperText="Maximum number of players allowed"
              required
              fullWidth
            />

            <Input
              label="Game Duration (Days)"
              type="number"
              min="1"
              max="365"
              value={resolutionDays}
              onChange={(e) => setResolutionDays(e.target.value)}
              error={errors.resolutionDays}
              helperText="How many days until the game resolves"
              required
              fullWidth
            />
          </div>
        </Card>

        {/* Category Selection */}
        <Card padding="lg">
          <h2 className="text-xl font-semibold mb-4">Select Categories</h2>

          {errors.categories && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.categories}</p>
            </div>
          )}

          <CategoryCarousel
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
          />
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/')}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading || selectedCategories.length < MIN_CATEGORIES_REQUIRED}
            className="flex-1"
          >
            Create Game
          </Button>
        </div>
      </form>
    </div>
  );
}
