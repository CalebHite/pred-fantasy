'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { GameCodeInput } from '@/components/ui/GameCodeInput';
import { useWallet } from '@/contexts/WalletContext';
import { useUI } from '@/contexts/UIContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { wallet } = useWallet();
  const { openModal } = useUI();
  const router = useRouter();
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');

  const handleCreateGame = () => {
    if (!wallet?.isConnected) {
      openModal('wallet');
    } else {
      router.push('/create-game');
    }
  };

  const handleJoinGame = () => {
    document.getElementById('join-game')?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const handleComplete = (code: string) => {
    // Auto-continue when code is complete
    if (code.length === 6) {
      router.push(`/join/${code}`);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="min-h-[calc(100vh-5rem)] flex items-start bg-white relative overflow-hidden">
        {/* Background Image - Cropped on Right */}
        <div
          className="absolute right-0 top-0 bottom-0 w-full lg:w-[50%] bg-cover bg-center opacity-20 lg:opacity-100"
          style={{ backgroundImage: 'url(/images/bg.png)' }}
        />

        {/* Content */}
        <div className="relative z-10 pl-20 pt-64 w-full">
          <div className="max-w-xl space-y-8">
            {/* Heading */}
            <div className="">
              <h1 className="text-5xl lg:text-6xl font-medium text-black leading-tight">
                Predictions Versus
              </h1>
              <p className="text-xl lg:text-2xl font-light text-black">
                Winner takes all.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCreateGame}
                variant="black"
                size="lg"
              >
                Create game
              </Button>
              <Button
                onClick={handleJoinGame}
                variant="outline-black"
                size="lg"
              >
                Join game
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Join Game Section */}
      <div id="join-game" className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-2xl flex flex-col items-center">
          {/* Title */}
          <h1 className="text-5xl font-medium text-black text-center mb-8">
            Join a game
          </h1>

          {/* Content - Centered */}
          <div className="w-full max-w-lg">
            {/* Game Code Input */}
            <div className="mb-8">
              <label className="block text-base !font-bold text-black mb-3 text-left pl-[52px]">
                Game Code
              </label>
              <GameCodeInput
                value={gameCode}
                onChange={handleGameCodeChange}
                onComplete={handleComplete}
                error={error}
                length={6}
              />
            </div>

            {/* Continue Button */}
            <div className="flex justify-start pl-[52px]">
              <Button
                onClick={handleContinue}
                variant="black"
                size="lg"
                className="!w-[140px]"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
