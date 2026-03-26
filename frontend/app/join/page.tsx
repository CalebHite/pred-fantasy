'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { GameCodeInput } from '@/components/ui/GameCodeInput';

export default function JoinPage() {
  const router = useRouter();
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');

  const handleGameCodeChange = (value: string) => {
    setGameCode(value);
    setError('');
  };

  const handleContinue = () => {
    if (gameCode.length !== 6) {
      setError('Please enter a valid 6-character game code');
      return;
    }

    router.push(`/join/${gameCode}`);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Image
            src="/icons/swords.svg"
            alt="Predictions Versus"
            width={48}
            height={48}
            className="w-12 h-12"
          />
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm">
          {/* Title */}
          <h1 className="text-4xl font-medium text-gray-900 text-center mb-12">
            Join a game
          </h1>

          {/* Game Code Input */}
          <div className="mb-8">
            <label className="block text-lg font-light text-gray-700 mb-6 text-center">
              Game Code
            </label>
            <GameCodeInput
              value={gameCode}
              onChange={handleGameCodeChange}
              error={error}
              length={6}
            />
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleContinue}
              disabled={gameCode.length !== 6}
              variant="black"
              size="lg"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
