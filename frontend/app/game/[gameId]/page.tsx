'use client';

import { useEffect, use, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { getCategoryIcon, getCategoryIconSize } from '@/lib/categoryIcons';
import { CategoryPickWizard } from '@/components/predictions/CategoryPickWizard';
import { GameStatusIndicator } from '@/components/game/GameStatusIndicator';
import { Scoreboard } from '@/components/game/Scoreboard';
import { PnLChart } from '@/components/game/PnLChart';
import { UserBets, UserBet } from '@/components/game/UserBets';
import { useWallet } from '@/contexts/WalletContext';
import { useGame } from '@/contexts/GameContext';
import { useUI } from '@/contexts/UIContext';
import {
  fetchGame as apiFetchGame,
  fetchPredictions,
  submitPredictions,
  fetchEvent,
  ApiGame,
  ApiPrediction,
  ApiGeminiEvent,
} from '@/lib/api/client';
import { ScoreboardEntry } from '@/data/mock-scores';
import { MarketStrikes } from '@/data/mock-strikes';

interface PageProps {
  params: Promise<{ gameId: string }>;
}

/**
 * Assign a consistent color to each participant based on index.
 * Supports up to 10 participants; cycles through colors if more participants join.
 * Colors are used for charts, avatars, and visual identification.
 */
const PARTICIPANT_COLORS = [
  '#FF6B35', '#00D9FF', '#9D4EDD', '#06FFA5', '#FFB700',
  '#FF4D6D', '#3A86FF', '#FB5607', '#8338EC', '#FFBE0B',
];

export default function GamePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { wallet } = useWallet();
  const { currentGame, loadGame } = useGame();
  const { openModal, showNotification } = useUI();
  const [view, setView] = useState<'predictions' | 'live'>('live');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Real data state
  const [apiGame, setApiGame] = useState<ApiGame | null>(null);
  const [predictions, setPredictions] = useState<ApiPrediction[]>([]);
  const [allPredictions, setAllPredictions] = useState<ApiPrediction[]>([]);
  const [geminiEvents, setGeminiEvents] = useState<Record<string, ApiGeminiEvent>>({});
  const [markets, setMarkets] = useState<MarketStrikes[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load game from context
  useEffect(() => {
    loadGame(resolvedParams.gameId);
  }, [resolvedParams.gameId, loadGame]);

  // Load all real data once we have a game ID
  const loadRealData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const gameId = resolvedParams.gameId;

      // Fetch game details and all predictions in parallel
      const [game, allPreds] = await Promise.all([
        apiFetchGame(gameId),
        fetchPredictions(gameId).catch(() => [] as ApiPrediction[]),
      ]);

      setApiGame(game);
      setAllPredictions(allPreds);

      // Filter predictions for current user
      if (wallet?.address) {
        const myParticipant = game.participants.find(
          (p) => p.walletAddress === wallet.address
        );
        if (myParticipant) {
          const myPreds = allPreds.filter(
            (p) => p.participantId === myParticipant.id
          );
          setPredictions(myPreds);
        }
      }

      // Fetch Gemini event details for each game event (for contracts/strikes)
      const eventPromises = game.events.map(async (evt) => {
        try {
          const geminiEvent = await fetchEvent(evt.eventTicker);
          return [evt.eventTicker, geminiEvent] as const;
        } catch {
          return null;
        }
      });

      const results = await Promise.all(eventPromises);
      const eventsMap: Record<string, ApiGeminiEvent> = {};
      const marketsList: MarketStrikes[] = [];

      for (const result of results) {
        if (!result) continue;
        const [ticker, geminiEvent] = result;
        eventsMap[ticker] = geminiEvent;

        // Build MarketStrikes from Gemini contracts
        marketsList.push({
          categoryId: ticker,
          categoryName: geminiEvent.title,
          strikes: geminiEvent.contracts.map((contract) => {
            const ask = Number(contract.prices?.bestAsk);
            return {
              id: contract.ticker,
              label: contract.label,
              odds: !isNaN(ask) && ask > 0
                ? `${Math.round(ask * 100)}¢`
                : undefined,
            };
          }),
        });
      }

      setGeminiEvents(eventsMap);
      setMarkets(marketsList);
    } catch (err) {
      console.error('Failed to load game data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [resolvedParams.gameId, wallet?.address]);

  useEffect(() => {
    loadRealData();
  }, [loadRealData]);

  useEffect(() => {
    if (!wallet?.isConnected) {
      openModal('wallet');
    }
  }, [wallet, openModal]);

  // Build scoreboard from real participants using PnL (current value vs cost basis)
  const buildScoreboard = useCallback((): ScoreboardEntry[] => {
    if (!apiGame) return [];

    return apiGame.participants.map((p, idx) => {
      const participantPreds = allPredictions.filter(
        (pred) => pred.participantId === p.id
      );

      let totalCost = 0;
      let totalValue = 0;
      let pricedCount = 0;
      const positions = [];

      for (const pred of participantPreds) {
        const geminiEvent = geminiEvents[pred.eventTicker];
        const contract = geminiEvent?.contracts.find((c) => c.ticker === pred.contractTicker);

        // Current value from live price
        const rawCurrent = contract?.prices?.lastTradePrice ?? contract?.prices?.bestAsk;
        const currentPrice = Number(rawCurrent);

        // Entry price from when prediction was made
        const entryPrice = Number(pred.entryPrice);

        if (!isNaN(currentPrice) && currentPrice > 0) {
          const effectiveEntry = !isNaN(entryPrice) && entryPrice > 0 ? entryPrice : currentPrice;
          totalValue += currentPrice;
          totalCost += effectiveEntry;
          pricedCount++;

          // Add position detail for tooltip
          const positionPnl = currentPrice - effectiveEntry;
          const positionPnlPercent = effectiveEntry > 0 ? (positionPnl / effectiveEntry) * 100 : 0;
          positions.push({
            contractLabel: pred.contractLabel || contract?.label || pred.contractTicker,
            entryPrice: effectiveEntry,
            currentPrice,
            pnl: positionPnl,
            pnlPercent: positionPnlPercent,
          });
        }
      }

      const pnl = totalValue - totalCost;
      const avgOdds = pricedCount > 0 ? totalValue / pricedCount : 0;

      return {
        userId: String(p.id),
        nickname: p.nickname,
        address: p.walletAddress,
        score: Math.round(pnl * 100), // cents for display
        avgOdds,
        numPicks: participantPreds.length,
        totalCost,
        totalValue,
        pnl,
        positions,
        rank: idx + 1,
        color: PARTICIPANT_COLORS[idx % PARTICIPANT_COLORS.length],
      };
    })
    .sort((a, b) => (b.pnl ?? 0) - (a.pnl ?? 0))
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  }, [apiGame, allPredictions, geminiEvents]);

  // Build user bets from real predictions
  const buildUserBets = useCallback((): UserBet[] => {
    if (!apiGame) return [];

    return predictions.map((pred) => {
      const gameEvent = apiGame.events.find((e) => e.eventTicker === pred.eventTicker);
      const geminiEvent = geminiEvents[pred.eventTicker];
      const contract = geminiEvent?.contracts.find((c) => c.ticker === pred.contractTicker);

      let status: UserBet['status'] = 'pending';
      if (pred.isCorrect === true) status = 'winning';
      else if (pred.isCorrect === false) status = 'losing';

      const askPrice = Number(contract?.prices?.bestAsk);

      return {
        id: String(pred.id),
        categoryId: pred.eventTicker,
        categoryKey: pred.categoryKey || undefined,
        categoryName: pred.eventTitle || gameEvent?.eventTitle || pred.eventTicker,
        selectedOption: pred.contractLabel || contract?.label || pred.contractTicker,
        currentOdds: !isNaN(askPrice) && askPrice > 0
          ? `${Math.round(askPrice * 100)}¢`
          : undefined,
        status,
      };
    });
  }, [apiGame, predictions, geminiEvents]);

  // Memoize current user's participant ID to avoid duplicate lookups
  // Must be before early returns to follow Rules of Hooks
  const currentUserId = useMemo(() => {
    if (!apiGame || !wallet?.address) return undefined;
    const participant = apiGame.participants.find((p) => p.walletAddress === wallet.address);
    return participant ? String(participant.id) : undefined;
  }, [apiGame, wallet?.address]);

  // Memoize expensive computations
  const scoreboard = useMemo(() => buildScoreboard(), [buildScoreboard]);
  const userBets = useMemo(() => buildUserBets(), [buildUserBets]);

  if (!currentGame || currentGame.id !== resolvedParams.gameId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-medium text-gray-900 mb-3">Game Not Found</h1>
          <p className="text-base font-light text-gray-600 mb-8">
            This game does not exist or you don&apos;t have access to it.
          </p>
          <Button onClick={() => router.push('/')} variant="black" size="lg">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const isHost = wallet?.address === currentGame.host;

  const handlePredictionsComplete = async (predictions: Array<{
    categoryKey: string;
    eventTicker: string;
    contractTicker: string;
    outcome: 'yes' | 'no';
  }>) => {
    if (!wallet?.address) return;

    try {
      // Add entry prices to predictions
      const picks = predictions.map(pred => {
        const geminiEvent = geminiEvents[pred.eventTicker];
        const contract = geminiEvent?.contracts.find((c) => c.ticker === pred.contractTicker);
        const entryPrice = contract?.prices?.bestAsk?.toString();
        return {
          categoryKey: pred.categoryKey,
          eventTicker: pred.eventTicker,
          contractTicker: pred.contractTicker,
          outcome: pred.outcome,
          entryPrice,
        };
      });

      await submitPredictions(resolvedParams.gameId, {
        walletAddress: wallet.address,
        picks,
      });

      showNotification({
        message: 'Predictions submitted successfully!',
        type: 'success',
      });
      setView('live');

      // Reload data to reflect new predictions
      loadRealData();
    } catch (err) {
      showNotification({
        message: err instanceof Error ? err.message : 'Failed to submit predictions',
        type: 'error',
      });
    }
  };

  const handleStartPredictions = () => {
    setView('predictions');
  };

  // Calculate time remaining
  const timeRemaining = Math.floor(
    (new Date(currentGame.config.resolutionTime).getTime() - new Date().getTime()) / 1000
  );

  // Computed boolean for showing "Make Picks" button
  const isParticipant = currentGame.participants.some((p) => p.address === wallet?.address);
  const shouldShowMakePicksButton = isParticipant &&
    predictions.length === 0 &&
    apiGame?.categories &&
    apiGame.categories.length > 0;

  if (view === 'predictions') {
    // Use CategoryPickWizard if game has categories, otherwise fall back to old system
    if (apiGame && apiGame.categories && apiGame.categories.length > 0) {
      return (
        <div className="min-h-screen bg-gray-50">
          <CategoryPickWizard
            gameCategories={apiGame.categories}
            onComplete={handlePredictionsComplete}
          />
        </div>
      );
    }
    // Legacy: Fall back to old market-based system
    return (
      <div className="min-h-screen bg-gray-50">
        <p className="text-center py-12 text-gray-500">
          This game uses the legacy market selection system. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Bar - Status and Actions */}
      <div className="bg-gray-50 sticky top-20 z-30 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Game Code + Category Icons + Actions */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-gray-500">
                {currentGame.code}
              </span>
              {apiGame?.categories && apiGame.categories.length > 0 && (
                <div className="flex items-center gap-1">
                  {apiGame.categories.map((cat) => {
                    const iconSize = getCategoryIconSize(cat.categoryKey);
                    return (
                      <Image
                        key={cat.categoryKey}
                        src={getCategoryIcon(cat.categoryKey)}
                        alt={cat.categoryName}
                        width={iconSize}
                        height={iconSize}
                        className="w-8 h-8 object-contain"
                        title={cat.categoryName}
                      />
                    );
                  })}
                </div>
              )}
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share"
                aria-label="Share game code"
                onClick={() => {
                  navigator.clipboard.writeText(currentGame.code);
                  showNotification({ message: 'Game code copied!', type: 'success' });
                }}
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
                aria-label="Open game settings"
                onClick={() => setShowSettingsModal(true)}
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>

            {/* Center: Game Status */}
            <GameStatusIndicator
              status={currentGame.status}
              timeRemaining={timeRemaining > 0 ? timeRemaining : undefined}
            />

            {/* Right: Make Predictions button */}
            <div className="w-[200px] flex justify-end">
              {shouldShowMakePicksButton && (
                <Button onClick={handleStartPredictions} variant="outline-black" size="lg" className="w-full">
                  Make Picks
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {isLoadingData ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm font-light text-gray-500">Loading game data...</p>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Panel - Your Bets */}
              <div className="lg:col-span-1">
                <UserBets bets={userBets} />
                {/* Show events list if no predictions yet */}
                {userBets.length === 0 && markets.length > 0 && (
                  <div className="mt-4 bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-medium text-black mb-4">Events in This Game</h3>
                    <div className="space-y-2">
                      {markets.map((m) => (
                        <div
                          key={m.categoryId}
                          className="p-3 rounded-xl border border-gray-200 text-sm"
                        >
                          <p className="font-medium text-gray-900">{m.categoryName}</p>
                          <p className="text-xs font-light text-gray-500 mt-1">
                            {m.strikes.length} contract{m.strikes.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel - Scoreboard */}
              <div className="lg:col-span-2">
                <Scoreboard
                  participants={scoreboard}
                  currentUserId={currentUserId}
                />
              </div>
            </div>

            {/* PnL Chart */}
            <div className="mt-8">
              <PnLChart
                participants={scoreboard}
                currentUserId={currentUserId}
              />
            </div>
          </>
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close settings"
              onClick={() => setShowSettingsModal(false)}
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal content */}
            <h2 className="text-2xl font-medium text-black mb-6">Game Settings</h2>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-sm font-light text-gray-500">Buy-in</p>
                <p className="text-2xl font-medium text-black mt-1">
                  ${currentGame.config.buyInAmount}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-sm font-light text-gray-500">Participants</p>
                <p className="text-2xl font-medium text-black mt-1">
                  {currentGame.participants.length}
                  {currentGame.config.maxParticipants && (
                    <span className="text-sm font-light text-gray-400">
                      {' '}/ {currentGame.config.maxParticipants}
                    </span>
                  )}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-sm font-light text-gray-500">Events</p>
                <p className="text-2xl font-medium text-black mt-1">
                  {apiGame?.events.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
