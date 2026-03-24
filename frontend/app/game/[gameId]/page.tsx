'use client';

import { useEffect, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameTimer } from '@/components/game/GameTimer';
import { ParticipantsList } from '@/components/game/ParticipantsList';
import { GameCodeDisplay } from '@/components/game/GameCodeDisplay';
import { PredictionSelector } from '@/components/predictions/PredictionSelector';
import { useWallet } from '@/contexts/WalletContext';
import { useGame } from '@/contexts/GameContext';
import { useUI } from '@/contexts/UIContext';
import { formatCurrency } from '@/lib/utils/format';
import { getCategoryById } from '@/data/mock-categories';

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export default function GamePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { wallet } = useWallet();
  const { games, loadGame, currentGame } = useGame();
  const { openModal, showNotification } = useUI();
  const [showPredictions, setShowPredictions] = useState(false);

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
  const totalPot = currentGame.config.buyInAmount * currentGame.participants.length;

  const handleSubmitPredictions = (predictions: Record<string, string>) => {
    showNotification({
      message: 'Predictions submitted successfully!',
      type: 'success',
    });
    setShowPredictions(false);
    // TODO: Save predictions to backend/context
  };

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
            'bg-gray-100 text-gray-700'
          }`}>
            {currentGame.status}
          </span>
        </div>
        <p className="text-gray-600">
          Track your predictions and compete with other players
        </p>
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
              <div className="text-4xl mb-2">💰</div>
              <div className="text-3xl font-bold text-amber-900">
                {formatCurrency(totalPot)}
              </div>
              <p className="text-sm text-amber-700 mt-2">
                Winner takes all!
              </p>
            </div>
          </Card>

          {/* Categories */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold mb-4">
              Prediction Categories ({currentGame.config.categories.length})
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {currentGame.config.categories.map((catId) => {
                const category = getCategoryById(catId);
                if (!category) return null;

                return (
                  <div
                    key={catId}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{category.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">
                          {category.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {category.description}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                  Select one strike for each market. You can change your predictions before the game closes.
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
                categoryIds={currentGame.config.categories}
                onSubmit={handleSubmitPredictions}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Game Code */}
          {isHost && (
            <GameCodeDisplay
              gameCode={currentGame.code}
              gameId={currentGame.id}
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

              <Button
                fullWidth
                onClick={() => setShowPredictions(!showPredictions)}
                variant={showPredictions ? "secondary" : "primary"}
              >
                {showPredictions ? 'Hide Predictions' : 'Make Predictions'}
              </Button>

              {isHost && (
                <Button
                  fullWidth
                  variant="secondary"
                  disabled
                >
                  Game Settings (Coming Soon)
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
