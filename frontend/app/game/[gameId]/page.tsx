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
  const [view, setView] = useState<'predictions' | 'live'>('live');

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
  const isParticipant = currentGame.participants.some((p) => p.address === wallet?.address);

  // Get market data for predictions
  const markets = currentGame.config.categories
    .map((catId) => getStrikesForCategory(catId))
    .filter((m): m is NonNullable<typeof m> => m !== null && m !== undefined);

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
      <div className="bg-gray-50 sticky top-20 z-30 pt-8">
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

            {/* Right: Empty space for symmetry */}
            <div className="w-[140px]"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Your Bets */}
          <div className="lg:col-span-1">
            <UserBets bets={userBets} />
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
