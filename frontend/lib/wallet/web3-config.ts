import { createConfig, http } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors';

const ENABLE_REAL_WALLET = process.env.NEXT_PUBLIC_ENABLE_REAL_WALLET === 'true';

// Configure connectors (only if real wallet is enabled)
export const connectors = ENABLE_REAL_WALLET ? [
  // Gemini Wallet
  injected({
    target: 'gemini',
  }),

  // MetaMask
  injected({
    target: 'metaMask',
  }),

  // Coinbase Wallet
  coinbaseWallet({
    appName: 'Fantasy Prediction Markets',
    appLogoUrl: typeof window !== 'undefined' ? `${window.location.origin}/icons/swords.svg` : undefined,
  }),

  // Rainbow Wallet
  injected({
    target: 'rainbow',
  }),

  // WalletConnect (only if project ID is provided)
  ...(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? [walletConnect({
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    metadata: {
      name: 'Fantasy Prediction Markets',
      description: 'Fantasy prediction markets app',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      icons: [typeof window !== 'undefined' ? `${window.location.origin}/icons/swords.svg` : ''],
    },
  })] : []),

  // Phantom Wallet
  injected({
    target: 'phantom',
  }),
] : [];

// Create wagmi config (minimal config for mock mode)
export const wagmiConfig = createConfig({
  chains: [polygon],
  connectors,
  transports: {
    [polygon.id]: http(),
  },
  ssr: true, // Important for Next.js
});

// Chain configuration
export const SUPPORTED_CHAIN_ID = polygon.id;
export const SUPPORTED_CHAIN = polygon;
