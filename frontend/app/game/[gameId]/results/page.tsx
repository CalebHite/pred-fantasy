'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGame } from '@/contexts/GameContext';
import { formatCurrency, formatAddress } from '@/lib/utils/format';

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export default function GameResultsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { games, loadGame } = useGame();

  useEffect(() => {
    loadGame(resolvedParams.gameId);
  }, [resolvedParams.gameId, loadGame]);

  const game = games.find((g) => g.id === resolvedParams.gameId);

  if (!game) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card padding="lg" className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Game Not Found</h1>
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  const totalPot = game.config.buyInAmount * game.participants.length;

  // Mock winner (first participant for demo purposes)
  const winner = game.participants[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Game Results</h1>
        <p className="text-gray-600">Final standings and payouts</p>
      </div>

      <div className="space-y-6">
        {/* Winner Announcement */}
        <Card padding="lg" className="bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-amber-900 mb-2">Winner!</h2>
            <p className="text-3xl font-bold text-amber-900 mb-2">
              {winner.nickname || 'Anonymous'}
            </p>
            <p className="text-sm text-amber-700 font-mono mb-4">
              {formatAddress(winner.address)}
            </p>
            <div className="inline-block px-6 py-3 bg-amber-900 text-white rounded-lg">
              <div className="text-sm mb-1">Prize Won</div>
              <div className="text-2xl font-bold">{formatCurrency(totalPot)}</div>
            </div>
          </div>
        </Card>

        {/* Final Standings */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold mb-4">Final Standings</h3>

          <div className="space-y-3">
            {game.participants.map((participant, index) => (
              <div
                key={participant.address}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0
                    ? 'bg-amber-50 border-2 border-amber-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`text-2xl font-bold ${
                      index === 0 ? 'text-amber-600' : 'text-gray-400'
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {participant.nickname || 'Anonymous'}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {formatAddress(participant.address)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-600">Correct Predictions</div>
                  <div className="text-lg font-bold text-gray-900">
                    {/* Mock data - would come from actual predictions */}
                    {index === 0 ? game.config.categories.length : Math.floor(Math.random() * game.config.categories.length)}
                    /{game.config.categories.length}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Game Summary */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold mb-4">Game Summary</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total Participants</div>
              <div className="text-2xl font-bold text-gray-900">
                {game.participants.length}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Buy-in Amount</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(game.config.buyInAmount)}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total Categories</div>
              <div className="text-2xl font-bold text-gray-900">
                {game.config.categories.length}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Prize Pool</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalPot)}
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.push('/')} className="flex-1">
            Back to Home
          </Button>
          <Button onClick={() => router.push('/create-game')} className="flex-1">
            Create New Game
          </Button>
        </div>
      </div>
    </div>
  );
}
