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

  // Mock markets for testing
  const mockMarkets: ApiGeminiEvent[] = [
    { id: '1', ticker: 'BTC100K', title: 'Bitcoin to reach $100K by end of 2026', slug: 'btc-100k', description: '', imageUrl: '/icons/Bitcoin (BTC).svg', type: 'crypto', category: 'finance', status: 'active', contracts: [] },
    { id: '2', ticker: 'ETH10K', title: 'Ethereum to reach $10K by Q3 2026', slug: 'eth-10k', description: '', imageUrl: '/icons/Ether (ETH).svg', type: 'crypto', category: 'finance', status: 'active', contracts: [] },
    { id: '3', ticker: 'SUPERBOWL', title: 'NFL Super Bowl LXI Winner', slug: 'superbowl', description: '', imageUrl: '/icons/nfl.svg', type: 'sports', category: 'sports', status: 'active', contracts: [] },
    { id: '4', ticker: 'NBA', title: 'NBA Championship Winner 2026', slug: 'nba', description: '', imageUrl: '/icons/nba.svg', type: 'sports', category: 'sports', status: 'active', contracts: [] },
    { id: '5', ticker: 'EPL', title: 'English Premier League Winner', slug: 'epl', description: '', imageUrl: '/icons/epl.svg', type: 'sports', category: 'sports', status: 'active', contracts: [] },
    { id: '6', ticker: 'TENNIS', title: 'Wimbledon Champion 2026', slug: 'tennis', description: '', imageUrl: '/icons/tennis.svg', type: 'sports', category: 'sports', status: 'active', contracts: [] },
    { id: '7', ticker: 'SOL', title: 'Solana Price Prediction', slug: 'sol', description: '', imageUrl: '/icons/Solana (SOL).svg', type: 'crypto', category: 'finance', status: 'active', contracts: [] },
    { id: '8', ticker: 'XRP', title: 'XRP Price Prediction', slug: 'xrp', description: '', imageUrl: '/icons/XRP (XRP).svg', type: 'crypto', category: 'finance', status: 'active', contracts: [] },
  ];

  const [events, setEvents] = useState<ApiGeminiEvent[]>(mockMarkets);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Fetch live events from Gemini
  useEffect(() => {
    let cancelled = false;
    setEventsLoading(true);
    fetchEvents({ status: ['active'], limit: 50 })
      .then((res) => {
        if (!cancelled) {
          // If API returns data, use it; otherwise keep mock data
          if (res.data && res.data.length > 0) {
            setEvents(res.data);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Keep mock markets on error, don't show error notification for testing
          console.log('Using mock markets for testing');
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
      if (selectedEvents.length < MIN_CATEGORIES_REQUIRED) {
        showNotification({
          message: `Please select at least ${MIN_CATEGORIES_REQUIRED} markets`,
          type: 'error',
        });
      }
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

            {/* Markets Section */}
            <div className="pt-8">
                <h2 className="text-2xl font-medium text-gray-900 mb-6">Prediction Markets</h2>

                {eventsLoading ? (
                  <div className="flex justify-center py-12">
                    <Spinner />
                  </div>
                ) : events.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No active prediction markets found. Check back later or verify your Gemini API config.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-0">
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
                            'flex items-center justify-center w-16 h-16 transition-all',
                            isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-60',
                            !isSelected && selectedEvents.length >= MAX_CATEGORIES_ALLOWED
                              ? 'opacity-20 cursor-not-allowed'
                              : 'cursor-pointer'
                          )}
                        >
                          <Image
                            src={event.imageUrl}
                            alt={event.title}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
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
        </form>
      </div>
    </div>
  );
}
