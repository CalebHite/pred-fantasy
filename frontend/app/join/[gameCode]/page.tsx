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
import { Game } from '@/types';

interface PageProps {
  params: Promise<{ gameCode: string }>;
}

export default function JoinGamePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { wallet } = useWallet();
  const { joinGame, isLoading } = useGame();
  const { showNotification, openModal } = useUI();
  const [game, setGame] = useState<Game | null>(null);
  const [loadingGame, setLoadingGame] = useState(true);

  // Fetch the game by code from the API via the context
  useEffect(() => {
    let cancelled = false;
    setLoadingGame(true);

    // Use the joinGame flow — first fetch games to find by code
    import('@/lib/api/client').then(({ fetchGames }) => {
      fetchGames().then((apiGames) => {
        if (cancelled) return;
        const match = apiGames.find((g) => g.code === resolvedParams.gameCode.toUpperCase());
        if (match) {
          // Convert to Game shape
          setGame({
            id: match.id,
            code: match.code,
            host: match.hostAddress,
            config: {
              buyInAmount: match.buyInAmount,
              categories: match.events.map((e) => e.eventTicker),
              maxParticipants: match.maxParticipants ?? undefined,
              resolutionTime: new Date(match.resolutionTime),
              rules: match.rules ?? undefined,
            },
            participants: match.participants.map((p) => ({
              address: p.walletAddress,
              nickname: p.nickname,
              joinedAt: new Date(p.joinedAt),
              hasPaid: p.hasPaid,
            })),
            status: match.status as Game['status'],
            createdAt: new Date(match.createdAt),
            startedAt: match.startedAt ? new Date(match.startedAt) : undefined,
            resolvedAt: match.resolvedAt ? new Date(match.resolvedAt) : undefined,
          });
        }
        setLoadingGame(false);
      }).catch(() => {
        if (!cancelled) setLoadingGame(false);
      });
    });

    return () => { cancelled = true; };
  }, [resolvedParams.gameCode]);

  useEffect(() => {
    if (!wallet?.isConnected) {
      openModal('wallet');
    }
  }, [wallet, openModal]);

  const handleJoinGame = async () => {
    if (!wallet?.isConnected) {
      showNotification({ message: 'Please connect your wallet first', type: 'error' });
      return;
    }

    try {
      const joined = await joinGame(resolvedParams.gameCode);
      showNotification({ message: 'Successfully joined the game!', type: 'success' });
      router.push(`/game/${joined.id}`);
    } catch (error) {
      showNotification({
        message: error instanceof Error ? error.message : 'Failed to join game',
        type: 'error',
      });
    }
  };

  if (loadingGame) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card padding="lg" className="text-center">
          <div className="text-6xl mb-4">&#x274C;</div>
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
          <div className="text-5xl mb-3">&#x1F3B2;</div>
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
            <div className="text-gray-600 mb-2">Markets ({game.config.categories.length})</div>
            <div className="flex flex-wrap gap-2">
              {game.config.categories.map((ticker) => (
                <span
                  key={ticker}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {ticker}
                </span>
              ))}
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
                &#x2713; You&apos;ve already joined this game
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
