'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const joinRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

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

  // Bidirectional auto-scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (isAutoScrolling || !heroRef.current || !joinRef.current) return;

      const scrollPosition = window.scrollY;
      const scrollDirection = scrollPosition > lastScrollY.current ? 'down' : 'up';
      lastScrollY.current = scrollPosition;

      const heroHeight = heroRef.current.offsetHeight;
      const joinTop = joinRef.current.offsetTop;

      // Scrolling down: if past 40% of hero section, snap to join section
      if (scrollDirection === 'down' && scrollPosition > heroHeight * 0.4 && scrollPosition < heroHeight * 0.9) {
        setIsAutoScrolling(true);
        joinRef.current.scrollIntoView({ behavior: 'smooth' });
        // Reset after animation completes
        setTimeout(() => setIsAutoScrolling(false), 1000);
      }

      // Scrolling up: if in upper portion of join section, snap back to hero
      if (scrollDirection === 'up' && scrollPosition < joinTop + 200 && scrollPosition > heroHeight * 0.3) {
        setIsAutoScrolling(true);
        heroRef.current.scrollIntoView({ behavior: 'smooth' });
        // Reset after animation completes
        setTimeout(() => setIsAutoScrolling(false), 1000);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAutoScrolling]);

  return (
    <>
      {/* Hero Section */}
      <div ref={heroRef} className="min-h-[calc(100vh-5rem)] flex items-start bg-white relative overflow-hidden">
        {/* Background Image - Cropped on Right */}
        <div
          className="absolute right-0 top-0 bottom-0 w-full lg:w-[50%] bg-cover bg-center opacity-20 lg:opacity-100"
          style={{ backgroundImage: 'url(/images/background.png)' }}
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
      <div ref={joinRef} id="join-game" className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 bg-white">
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
