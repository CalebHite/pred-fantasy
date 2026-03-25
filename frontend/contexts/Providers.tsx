'use client';

import { ReactNode, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wallet/web3-config';
import { UIProvider } from './UIContext';
import { WalletProvider } from './WalletContext';
import { GameProvider } from './GameContext';

/**
 * Compose all context providers
 * Order matters:
 * 1. WagmiProvider + QueryClientProvider (required for wagmi hooks)
 * 2. UIProvider (UI state)
 * 3. WalletProvider (wallet state, depends on wagmi)
 * 4. GameProvider (game state, depends on WalletContext)
 */
export function Providers({ children }: { children: ReactNode }) {
  // Create QueryClient instance (must be useState to avoid recreating on every render)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000, // 1 minute
          },
        },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <UIProvider>
          <WalletProvider>
            <GameProvider>{children}</GameProvider>
          </WalletProvider>
        </UIProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
