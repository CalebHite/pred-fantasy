'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useWallet } from '@/contexts/WalletContext';
import { useGame } from '@/contexts/GameContext';
import { useUI } from '@/contexts/UIContext';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { getCategoryById } from '@/data/mock-categories';

interface PageProps {
  params: Promise<{ gameCode: string }>;
}

export default function JoinGamePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { wallet } = useWallet();
  const { games, joinGame, isLoading } = useGame();
  const { showNotification, openModal } = useUI();
  const [game, setGame] = useState(games.find((g) => g.code === resolvedParams.gameCode));

  useEffect(() => {
    const foundGame = games.find((g) => g.code === resolvedParams.gameCode);
    setGame(foundGame);
  }, [games, resolvedParams.gameCode]);

  useEffect(() => {
    if (!wallet?.isConnected) {
      openModal('wallet');
    }
  }, [wallet, openModal]);

  const handleJoinGame = async () => {
    if (!wallet?.isConnected) {
      showNotification({
        message: 'Please connect your wallet first',
        type: 'error',
      });
      return;
    }

    try {
      await joinGame(resolvedParams.gameCode);
      showNotification({
        message: 'Successfully joined the game!',
        type: 'success',
      });

      const joinedGame = games.find((g) => g.code === resolvedParams.gameCode);
      if (joinedGame) {
        router.push(`/game/${joinedGame.id}`);
      }
    } catch (error) {
      showNotification({
        message: error instanceof Error ? error.message : 'Failed to join game',
        type: 'error',
      });
    }
  };

  if (!game) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card padding="lg" className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Game Not Found</h1>
          <p className="text-gray-600 mb-6">
            The game code <span className="font-mono font-bold">{resolvedParams.gameCode}</span> does not exist or is no longer available.
          </p>
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  const isAlreadyJoined = wallet?.isConnected && game.participants.some((p) => p.address === wallet.address);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card padding="lg">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎲</div>
          <h1 className="text-2xl font-bold mb-2">Join Game</h1>
          <p className="text-gray-600">
            Game Code: <span className="font-mono font-bold text-blue-600">{game.code}</span>
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between py-3 border-b">
            <span className="text-gray-600">Buy-in Amount</span>
            <span className="font-semibold">{formatCurrency(game.config.buyInAmount)}</span>
          </div>

          <div className="flex justify-between py-3 border-b">
            <span className="text-gray-600">Participants</span>
            <span className="font-semibold">
              {game.participants.length}
              {game.config.maxParticipants && ` / ${game.config.maxParticipants}`}
            </span>
          </div>

          <div className="flex justify-between py-3 border-b">
            <span className="text-gray-600">Resolves</span>
            <span className="font-semibold">{formatDate(game.config.resolutionTime)}</span>
          </div>

          <div className="py-3 border-b">
            <div className="text-gray-600 mb-2">Categories ({game.config.categories.length})</div>
            <div className="flex flex-wrap gap-2">
              {game.config.categories.map((catId) => {
                const category = getCategoryById(catId);
                return (
                  <span
                    key={catId}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {category?.icon} {category?.name}
                  </span>
                );
              })}
            </div>
          </div>

          {game.config.rules && (
            <div className="py-3">
              <div className="text-gray-600 mb-1">Rules</div>
              <p className="text-sm text-gray-700">{game.config.rules}</p>
            </div>
          )}
        </div>

        {isAlreadyJoined ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 text-center">
                ✓ You&apos;ve already joined this game
              </p>
            </div>
            <Button fullWidth onClick={() => router.push(`/game/${game.id}`)}>
              Go to Game
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {!wallet?.isConnected && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700 text-center">
                  Connect your wallet to join this game
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/')} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleJoinGame}
                loading={isLoading}
                disabled={isLoading || !wallet?.isConnected}
                className="flex-1"
              >
                Join Game
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
