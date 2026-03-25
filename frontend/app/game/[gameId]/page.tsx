'use client';

import { useEffect, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PredictionWizard } from '@/components/predictions/PredictionWizard';
import { GameStatusIndicator } from '@/components/game/GameStatusIndicator';
import { LiveOddsChart } from '@/components/game/LiveOddsChart';
import { Scoreboard } from '@/components/game/Scoreboard';
import { UserBets, UserBet } from '@/components/game/UserBets';
import { useWallet } from '@/contexts/WalletContext';
import { useGame } from '@/contexts/GameContext';
import { useUI } from '@/contexts/UIContext';
import { getStrikesForCategory, MOCK_STRIKES } from '@/data/mock-strikes';
import { MOCK_ODDS_HISTORY, MOCK_ODDS_USERS } from '@/data/mock-odds';
import { MOCK_SCOREBOARD } from '@/data/mock-scores';
import clsx from 'clsx';

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export default function GamePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { wallet } = useWallet();
  const { currentGame, loadGame } = useGame();
  const { openModal, showNotification } = useUI();
  const [view, setView] = useState<'predictions' | 'live'>('predictions');
  const [leftPanelView, setLeftPanelView] = useState<'bets' | 'markets'>('bets');

  // Mock user bets data
  const [userBets, setUserBets] = useState<UserBet[]>([
    {
      id: '1',
      categoryId: 'nfl-superbowl',
      categoryName: 'NFL Super Bowl Winner',
      selectedOption: 'Kansas City Chiefs',
      initialOdds: '+350',
      currentOdds: '+300',
      status: 'winning',
    },
    {
      id: '2',
      categoryId: 'btc-100k',
      categoryName: 'Bitcoin $100K',
      selectedOption: 'Yes, by Q2 2026',
      initialOdds: '+150',
      currentOdds: '+180',
      status: 'pending',
    },
  ]);

  useEffect(() => {
    loadGame(resolvedParams.gameId);
  }, [resolvedParams.gameId, loadGame]);

  useEffect(() => {
    if (!wallet?.isConnected) {
      openModal('wallet');
    }
  }, [wallet, openModal]);

  if (!currentGame || currentGame.id !== resolvedParams.gameId) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card padding="lg" className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Game Not Found</h1>
          <p className="text-gray-600 mb-6">
            This game does not exist or you don&apos;t have access to it.
          </p>
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  const isHost = wallet?.address === currentGame.host;
  const isParticipant = currentGame.participants.some((p) => p.address === wallet?.address);

  // Get market data for predictions
  const markets = currentGame.config.categories
    .map((catId) => {
      const strikes = getStrikesForCategory(catId);
      if (!strikes) return null;
      return MOCK_STRIKES[catId];
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  const handlePredictionsComplete = (predictions: Record<string, string>) => {
    showNotification({
      message: 'Predictions submitted successfully!',
      type: 'success',
    });
    setView('live');
    // TODO: Save predictions to backend/context
  };

  const handleStartPredictions = () => {
    setView('predictions');
  };

  // Calculate time remaining (mock)
  const timeRemaining = Math.floor(
    (new Date(currentGame.config.resolutionTime).getTime() - new Date().getTime()) / 1000
  );

  if (view === 'predictions') {
    return (
      <div className="min-h-screen bg-gray-50">
        <PredictionWizard markets={markets} onComplete={handlePredictionsComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Bar - Status and Actions */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Settings/Share Icons */}
            <div className="flex items-center gap-3">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
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
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share"
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
            </div>

            {/* Center: Game Status */}
            <GameStatusIndicator
              status={currentGame.status}
              timeRemaining={timeRemaining > 0 ? timeRemaining : undefined}
            />

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline-black" size="md" onClick={handleStartPredictions}>
                Edit Predictions
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Bets/Markets Toggle */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-t-2xl p-2 flex gap-2">
              <button
                onClick={() => setLeftPanelView('bets')}
                className={clsx(
                  'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  leftPanelView === 'bets'
                    ? 'bg-black text-white'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                )}
              >
                Your Bets
              </button>
              <button
                onClick={() => setLeftPanelView('markets')}
                className={clsx(
                  'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  leftPanelView === 'markets'
                    ? 'bg-black text-white'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                )}
              >
                All Markets
              </button>
            </div>

            <div className="mt-0">
              {leftPanelView === 'bets' ? (
                <UserBets bets={userBets} />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-xl font-medium text-black mb-4">All Markets</h3>
                  <div className="space-y-2">
                    {currentGame.config.categories.map((catId) => {
                      const market = MOCK_STRIKES[catId];
                      if (!market) return null;
                      return (
                        <div
                          key={catId}
                          className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {market.categoryName}
                          </p>
                          <p className="text-xs font-light text-gray-500 mt-1">
                            {market.strikes.length} options
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Scoreboard */}
          <div className="lg:col-span-2">
            <Scoreboard
              participants={MOCK_SCOREBOARD}
              currentUserId={wallet?.address ? 'user-1' : undefined}
            />
          </div>
        </div>

        {/* Live Odds Chart - Below Main Content */}
        <div className="mt-8">
          <LiveOddsChart data={MOCK_ODDS_HISTORY} users={MOCK_ODDS_USERS} />
        </div>
      </div>
    </div>
  );
}
