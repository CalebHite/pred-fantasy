'use client';

import { ReactNode } from 'react';
import { UIProvider } from './UIContext';
import { WalletProvider } from './WalletContext';
import { GameProvider } from './GameContext';

/**
 * Compose all context providers
 * Order matters: WalletProvider before GameProvider since GameProvider depends on WalletContext
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <UIProvider>
      <WalletProvider>
        <GameProvider>
          {children}
        </GameProvider>
      </WalletProvider>
    </UIProvider>
  );
}
