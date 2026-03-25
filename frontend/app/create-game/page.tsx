'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CategoryIconButton } from '@/components/ui/CategoryIconButton';
import { useWallet } from '@/contexts/WalletContext';
import { useGame } from '@/contexts/GameContext';
import { useUI } from '@/contexts/UIContext';
import { getActiveCategories } from '@/data/mock-categories';
import { GameConfig } from '@/types';
import { MIN_CATEGORIES_REQUIRED, MAX_CATEGORIES_ALLOWED } from '@/lib/utils/constants';
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
  const [maxParticipants, setMaxParticipants] = useState('');
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
      } else if (prev.length < MAX_CATEGORIES_ALLOWED) {
        return [...prev, categoryId];
      }
      return prev;
    });
    // Clear category error when user makes a selection
    if (errors.categories) {
      setErrors((prev) => {
        const { categories, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate buy-in
    const buyInValidation = validateBuyIn(parseFloat(buyInAmount));
    if (!buyInValidation.valid) {
      newErrors.buyInAmount = buyInValidation.error!;
    }

    // Validate max participants (optional)
    if (maxParticipants) {
      const maxParticipantsNum = parseInt(maxParticipants);
      const maxParticipantsValidation = validateMaxParticipants(maxParticipantsNum);
      if (!maxParticipantsValidation.valid) {
        newErrors.maxParticipants = maxParticipantsValidation.error!;
      }
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
      if (selectedCategories.length < MIN_CATEGORIES_REQUIRED) {
        showNotification({
          message: `Please select at least ${MIN_CATEGORIES_REQUIRED} categories`,
          type: 'error',
        });
      }
      return;
    }

    try {
      const config: GameConfig = {
        buyInAmount: parseFloat(buyInAmount),
        categories: selectedCategories,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
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
    <div className="min-h-[calc(100vh-5rem)] p-4 sm:p-8 lg:p-12 pt-16 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h1 className="text-4xl font-medium text-gray-900 mb-12">Create a new game</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            <div className="w-1/2 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-900 z-10">$</span>
              <Input
                label=""
                type="number"
                step="1"
                min="1"
                value={buyInAmount}
                onChange={(e) => setBuyInAmount(e.target.value)}
                error={errors.buyInAmount ? ' ' : undefined}
                placeholder="Buy-in amount"
                fullWidth
                className="text-lg h-16 pl-8"
              />
            </div>

            <div className="relative w-1/2">
              <Input
                label=""
                type="number"
                min="2"
                max="100"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                error={errors.maxParticipants}
                placeholder="Max participants (optional)"
                fullWidth
                className="text-lg h-16"
              />
              <Image
                src="/icons/arrows.svg"
                alt=""
                width={20}
                height={20}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
              />
            </div>

            {/* Continue Button */}
            <div className="w-1/2 flex justify-end">
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                variant="black"
                size="lg"
                className="!w-[140px]"
              >
                Continue
              </Button>
            </div>

            {/* Categories Section */}
            <div className="pt-8">
              <h2 className="text-xl !font-bold text-gray-900 mb-6">Categories</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <CategoryIconButton
                    key={category.id}
                    icon={category.icon}
                    label={category.name}
                    selected={selectedCategories.includes(category.id)}
                    onClick={() => handleCategoryToggle(category.id)}
                    disabled={
                      !selectedCategories.includes(category.id) &&
                      selectedCategories.length >= MAX_CATEGORIES_ALLOWED
                    }
                  />
                ))}
              </div>

              <p className="mt-4 text-sm font-light text-gray-600">
                Select {MIN_CATEGORIES_REQUIRED}-{MAX_CATEGORIES_ALLOWED} categories.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
