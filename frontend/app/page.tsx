'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useWallet } from '@/contexts/WalletContext';
import { useUI } from '@/contexts/UIContext';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { isValidGameCode } from '@/lib/game/game-generator';

export default function Home() {
  const { wallet } = useWallet();
  const { openModal } = useUI();
  const router = useRouter();
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');

  const handleConnectWallet = () => {
    openModal('wallet');
  };

  const handleJoinGame = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const code = gameCode.toUpperCase().trim();

    if (!isValidGameCode(code)) {
      setError('Invalid game code format');
      return;
    }

    router.push(`/join/${code}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Fantasy Prediction Markets
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100">
              Compete with friends, make predictions on real markets, and win the pot
            </p>

            {!wallet?.isConnected ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleConnectWallet}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-blue-700"
                  onClick={() => {
                    document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Learn More
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create-game">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
                  >
                    Create Game
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-blue-700"
                  onClick={() => {
                    document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Join Game
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card padding="lg" className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Create or Join</h3>
              <p className="text-gray-600">
                Set up a game with custom rules and categories, or join an existing game with a code
              </p>
            </Card>

            <Card padding="lg" className="text-center">
              <div className="text-4xl mb-4">🔮</div>
              <h3 className="text-xl font-bold mb-2">Make Predictions</h3>
              <p className="text-gray-600">
                Choose from prediction markets in sports, crypto, politics, and entertainment
              </p>
            </Card>

            <Card padding="lg" className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Winner Takes All</h3>
              <p className="text-gray-600">
                The player with the most correct predictions wins the entire pot
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card padding="lg" hover>
              <h3 className="text-xl font-bold mb-3">🎮 Custom Game Rules</h3>
              <p className="text-gray-600">
                Set your own buy-in amount, choose categories, and configure game duration
              </p>
            </Card>

            <Card padding="lg" hover>
              <h3 className="text-xl font-bold mb-3">⏱️ Live Countdown</h3>
              <p className="text-gray-600">
                Real-time countdown timer shows exactly when the game resolves
              </p>
            </Card>

            <Card padding="lg" hover>
              <h3 className="text-xl font-bold mb-3">👥 Multiplayer</h3>
              <p className="text-gray-600">
                Compete with friends or strangers in private or public games
              </p>
            </Card>

            <Card padding="lg" hover>
              <h3 className="text-xl font-bold mb-3">📊 Multiple Markets</h3>
              <p className="text-gray-600">
                Predict outcomes in sports, crypto, politics, entertainment, and more
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Join Game Section */}
      <section id="join" className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Join a Game</h2>
          <p className="text-center text-gray-600 mb-8">
            Have a game code? Enter it below to join an existing game
          </p>

          <Card padding="lg">
            <form onSubmit={handleJoinGame} className="flex flex-col gap-4">
              <Input
                label="Game Code"
                value={gameCode}
                onChange={(e) => {
                  setGameCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Enter 6-character code (e.g., PRED26)"
                maxLength={6}
                error={error}
                fullWidth
              />

              <Button type="submit" disabled={gameCode.length !== 6} fullWidth>
                Join Game
              </Button>

              <p className="text-xs text-center text-gray-500">
                Game codes are 6 characters long and are case-insensitive
              </p>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
