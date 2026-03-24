'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface GameCodeDisplayProps {
  gameCode: string;
  gameId: string;
}

export function GameCodeDisplay({ gameCode, gameId }: GameCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${gameCode}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card padding="lg" className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
      <h3 className="text-lg font-semibold mb-2">Share Game Code</h3>
      <p className="text-sm text-blue-100 mb-4">
        Share this code with friends to let them join your game
      </p>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 bg-white bg-opacity-20 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold tracking-wider font-mono">
            {gameCode}
          </div>
        </div>
      </div>

      <Button
        onClick={handleCopy}
        variant="outline"
        className="w-full border-white text-white hover:bg-white hover:text-blue-600"
      >
        {copied ? '✓ Copied!' : 'Copy Share Link'}
      </Button>
    </Card>
  );
}
