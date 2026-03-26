'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { useWallet } from '@/contexts/WalletContext';
import { useGame } from '@/contexts/GameContext';
import { useUI } from '@/contexts/UIContext';
import { MIN_CATEGORIES_REQUIRED, MAX_CATEGORIES_ALLOWED } from '@/lib/utils/constants';
import {
  validateBuyIn,
  validateMaxParticipants,
  validateResolutionTime,
} from '@/lib/utils/validation';
import { fetchGameCategories, ApiCategory } from '@/lib/api/client';

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

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Fetch categories from backend
  useEffect(() => {
    let cancelled = false;
    setCategoriesLoading(true);
    fetchGameCategories()
      .then((res) => {
        if (!cancelled && res.categories) {
          setCategories(res.categories);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Failed to fetch categories:', error);
          showNotification({
            message: 'Failed to load categories',
            type: 'error',
          });
        }
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => { cancelled = true; };
  }, [showNotification]);

  // Redirect if not connected
  useEffect(() => {
    if (!wallet?.isConnected) {
      openModal('wallet');
      router.push('/');
    }
  }, [wallet, router, openModal]);

  const handleCategoryToggle = (categoryKey: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryKey)) {
        return prev.filter((k) => k !== categoryKey);
      } else if (prev.length < MAX_CATEGORIES_ALLOWED) {
        return [...prev, categoryKey];
      }
      return prev;
    });
    // Clear error when user makes a selection
    if (errors.categories) {
      setErrors((prev) => {
        const { categories, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const buyInValidation = validateBuyIn(parseFloat(buyInAmount));
    if (!buyInValidation.valid) newErrors.buyInAmount = buyInValidation.error!;

    // Validate max participants (optional)
    if (maxParticipants) {
      const maxParticipantsNum = parseInt(maxParticipants);
      const maxParticipantsValidation = validateMaxParticipants(maxParticipantsNum);
      if (!maxParticipantsValidation.valid) {
        newErrors.maxParticipants = maxParticipantsValidation.error!;
      }
    }

    const resolutionTime = new Date(Date.now() + parseInt(resolutionDays) * 24 * 60 * 60 * 1000);
    const resolutionValidation = validateResolutionTime(resolutionTime);
    if (!resolutionValidation.valid) newErrors.resolutionDays = resolutionValidation.error!;

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
      const selectedCategoryObjects = categories.filter((cat) => selectedCategories.includes(cat.key));
      const game = await createGame({
        buyInAmount: parseFloat(buyInAmount),
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
        resolutionTime: new Date(Date.now() + parseInt(resolutionDays) * 24 * 60 * 60 * 1000),
        categories: selectedCategoryObjects.map((cat) => ({
          categoryKey: cat.key,
          categoryName: cat.name,
          categoryType: cat.type,
        })),
      });

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
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg !font-bold text-gray-900 z-10">$</span>
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

            <div className="w-1/2 relative">
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>

                {categoriesLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner />
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No categories available. Check back later.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-0">
                    {categories.map((category) => (
                      <CategoryCard
                        key={category.key}
                        category={category}
                        selected={selectedCategories.includes(category.key)}
                        disabled={
                          !selectedCategories.includes(category.key) &&
                          selectedCategories.length >= MAX_CATEGORIES_ALLOWED
                        }
                        onClick={() => handleCategoryToggle(category.key)}
                      />
                    ))}
                  </div>
                )}

                <p className="mt-4 text-sm font-light text-gray-600">
                  Select {MIN_CATEGORIES_REQUIRED}-{MAX_CATEGORIES_ALLOWED} categories.{' '}
                  <span className="font-normal">
                    {selectedCategories.length} selected
                  </span>
                </p>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
}
