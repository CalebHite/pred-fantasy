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
import { formatCurrency } from '@/lib/utils/format';
import { submitPredictions, startGame as apiStartGame } from '@/lib/api/client';

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export default function GamePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { wallet } = useWallet();
  const { loadGame, currentGame } = useGame();
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
          <div className="text-6xl mb-4">&#x274C;</div>
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

  const handleSubmitPredictions = async (
    predictions: { eventTicker: string; contractTicker: string; outcome: string }[]
  ) => {
    if (!wallet) return;

    try {
      await submitPredictions(currentGame.id, {
        walletAddress: wallet.address,
        picks: predictions,
      });
      showNotification({ message: 'Predictions submitted successfully!', type: 'success' });
      setShowPredictions(false);
    } catch (error) {
      showNotification({
        message: error instanceof Error ? error.message : 'Failed to submit predictions',
        type: 'error',
      });
    }
  };

  const handleStartGame = async () => {
    if (!wallet) return;
    try {
      await apiStartGame(currentGame.id, wallet.address);
      showNotification({ message: 'Game started! Orders are being placed.', type: 'success' });
      loadGame(currentGame.id); // refresh
    } catch (error) {
      showNotification({
        message: error instanceof Error ? error.message : 'Failed to start game',
        type: 'error',
      });
    }
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {isHost ? 'Your Game' : 'Game'}
          </h1>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            currentGame.status === 'active' ? 'bg-green-100 text-green-700' :
            currentGame.status === 'pending' ? 'bg-amber-100 text-amber-700' :
            currentGame.status === 'completed' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {currentGame.status}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timer */}
          <Card padding="lg">
            <GameTimer resolutionTime={currentGame.config.resolutionTime} />
          </Card>

          {/* Pot Info */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold mb-4">Prize Pool</h3>
            <div className="text-center py-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
              <div className="text-4xl mb-2">&#x1F4B0;</div>
              <div className="text-3xl font-bold text-amber-900">
                {formatCurrency(totalPot)}
              </div>
              <p className="text-sm text-amber-700 mt-2">Winner takes all!</p>
            </div>
          </Card>

          {/* Events in this game */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold mb-4">
              Prediction Markets ({currentGame.config.categories.length})
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {currentGame.config.categories.map((ticker) => (
                <div
                  key={ticker}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-gray-900">{ticker}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Rules */}
          {currentGame.config.rules && (
            <Card padding="lg">
              <h3 className="text-lg font-semibold mb-2">Rules</h3>
              <p className="text-gray-700">{currentGame.config.rules}</p>
            </Card>
          )}

          {/* Predictions Section */}
          {showPredictions && (
            <div>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Make Your Predictions</h2>
                <p className="text-gray-600">
                  Select one contract for each market. You can change your predictions before the game starts.
                </p>
              </div>
              {!isParticipant && (
                <Card padding="lg" className="mb-4 bg-amber-50 border-amber-200">
                  <p className="text-sm text-amber-800">
                    You are viewing this game but haven&apos;t joined yet. Join the game to submit predictions.
                  </p>
                </Card>
              )}
              <PredictionSelector
                eventTickers={currentGame.config.categories}
                onSubmit={handleSubmitPredictions}
              />
            </div>
          </div>

          {/* Right Panel - Scoreboard */}
          <div className="lg:col-span-2">
            <Scoreboard
              participants={MOCK_SCOREBOARD}
              currentUserId={wallet?.address ? 'user-1' : undefined}
            />
          )}

          {/* Participants */}
          <ParticipantsList
            participants={currentGame.participants}
            hostAddress={currentGame.host}
          />

          {/* Actions */}
          <Card padding="lg">
            <div className="space-y-3">
              {!isParticipant && (
                <p className="text-sm text-amber-600 mb-3">
                  You are viewing this game but haven&apos;t joined yet
                </p>
              )}

              {currentGame.status === 'pending' && isParticipant && (
                <Button
                  fullWidth
                  onClick={() => setShowPredictions(!showPredictions)}
                  variant={showPredictions ? 'secondary' : 'primary'}
                >
                  {showPredictions ? 'Hide Predictions' : 'Make Predictions'}
                </Button>
              )}

              {isHost && currentGame.status === 'pending' && (
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={handleStartGame}
                >
                  Start Game &amp; Place Orders
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
