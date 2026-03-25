'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useWallet } from '@/contexts/WalletContext';
import { useGame } from '@/contexts/GameContext';
import { useUI } from '@/contexts/UIContext';
import { MIN_CATEGORIES_REQUIRED, MAX_CATEGORIES_ALLOWED } from '@/lib/utils/constants';
import {
  validateBuyIn,
  validateMaxParticipants,
  validateResolutionTime,
} from '@/lib/utils/validation';
import { fetchEvents, ApiGeminiEvent } from '@/lib/api/client';
import clsx from 'clsx';

export default function CreateGamePage() {
  const router = useRouter();
  const { wallet } = useWallet();
  const { createGame, isLoading } = useGame();
  const { showNotification, openModal } = useUI();

  const [buyInAmount, setBuyInAmount] = useState('10');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [resolutionDays, setResolutionDays] = useState('7');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [events, setEvents] = useState<ApiGeminiEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Fetch live events from Gemini
  useEffect(() => {
    let cancelled = false;
    setEventsLoading(true);
    fetchEvents({ status: ['active'], limit: 50 })
      .then((res) => {
        if (!cancelled) setEvents(res.data);
      })
      .catch(() => {
        if (!cancelled) {
          showNotification({ message: 'Failed to load prediction markets', type: 'error' });
        }
      })
      .finally(() => {
        if (!cancelled) setEventsLoading(false);
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

  const handleEventToggle = (ticker: string) => {
    setSelectedEvents((prev) => {
      if (prev.includes(ticker)) {
        return prev.filter((t) => t !== ticker);
      } else if (prev.length < MAX_CATEGORIES_ALLOWED) {
        return [...prev, ticker];
      }
      return prev;
    });
    // Clear error when user makes a selection
    if (errors.events) {
      setErrors((prev) => {
        const { events, ...rest } = prev;
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

    if (selectedEvents.length < MIN_CATEGORIES_REQUIRED) {
      newErrors.events = `Please select at least ${MIN_CATEGORIES_REQUIRED} markets`;
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
      const selectedEventObjects = events.filter((ev) => selectedEvents.includes(ev.ticker));
      const game = await createGame({
        buyInAmount: parseFloat(buyInAmount),
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
        resolutionTime: new Date(Date.now() + parseInt(resolutionDays) * 24 * 60 * 60 * 1000),
        events: selectedEventObjects.map((ev) => ({
          ticker: ev.ticker,
          title: ev.title,
          type: ev.type,
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
    <div className="min-h-[calc(100vh-5rem)] p-4 sm:p-8 lg:p-12 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/icons/swords.svg"
            alt="Predictions Versus"
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-medium text-gray-900 mb-12">Create a new game</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Form Fields */}
            <div className="space-y-6">
              <Input
                label=""
                type="number"
                step="1"
                min="1"
                value={buyInAmount}
                onChange={(e) => setBuyInAmount(e.target.value)}
                error={errors.buyInAmount}
                placeholder="$ Buy-in amount"
                required
                fullWidth
                className="text-lg"
              />

              <div className="relative">
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
                  className="text-lg"
                />
                <Image
                  src="/icons/arrows.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                />
              </div>

              {/* Markets Section */}
              <div className="pt-8">
                <h2 className="text-2xl font-medium text-gray-900 mb-6">Prediction Markets</h2>

                {errors.events && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.events}</p>
                  </div>
                )}

                {eventsLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner />
                  </div>
                ) : events.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No active prediction markets found. Check back later or verify your Gemini API config.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {events.map((event) => {
                      const isSelected = selectedEvents.includes(event.ticker);
                      return (
                        <button
                          key={event.ticker}
                          type="button"
                          onClick={() => handleEventToggle(event.ticker)}
                          disabled={
                            !isSelected &&
                            selectedEvents.length >= MAX_CATEGORIES_ALLOWED
                          }
                          className={clsx(
                            'relative flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-200',
                            'border-2',
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
                            !isSelected && selectedEvents.length >= MAX_CATEGORIES_ALLOWED
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer'
                          )}
                        >
                          <div
                            className={clsx(
                              'w-16 h-16 rounded-full flex items-center justify-center transition-all',
                              isSelected ? 'bg-blue-100' : 'bg-gray-100'
                            )}
                          >
                            <span className="text-xs font-medium text-center px-1 leading-tight">
                              {event.ticker}
                            </span>
                          </div>
                          <span
                            className={clsx(
                              'text-sm font-light text-center line-clamp-2',
                              isSelected ? 'text-blue-700' : 'text-gray-700'
                            )}
                          >
                            {event.title}
                          </span>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <p className="mt-4 text-sm font-light text-gray-600">
                  Select {MIN_CATEGORIES_REQUIRED}-{MAX_CATEGORIES_ALLOWED} markets.{' '}
                  <span className="font-normal">
                    {selectedEvents.length} selected
                  </span>
                </p>
              </div>
            </div>

            {/* Right Column - Continue Button */}
            <div className="lg:flex lg:items-start lg:justify-end">
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading || selectedEvents.length < MIN_CATEGORIES_REQUIRED}
                variant="black"
                size="lg"
                className="w-full lg:w-auto"
              >
                Continue
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
