import { Connector } from 'wagmi';

// Map wallet IDs from UI to wagmi connectors
export const WALLET_CONNECTOR_MAP: Record<string, string> = {
  gemini: 'injected',
  metamask: 'injected',
  coinbase: 'coinbaseWalletSDK',
  rainbow: 'injected',
  walletconnect: 'walletConnect',
  phantom: 'injected',
};

// Get connector instance by wallet ID
export function getConnectorByWalletId(
  connectors: readonly Connector[],
  walletId: string
): Connector | undefined {
  const connectorType = WALLET_CONNECTOR_MAP[walletId];
  if (!connectorType) return undefined;

  // Find connector by ID or name
  return connectors.find(
    (c) => c.id === connectorType || c.id.includes(walletId) || c.name.toLowerCase().includes(walletId)
  );
}

// Check if wallet is installed (client-side only)
export function isWalletInstalled(walletId: string): boolean {
  if (typeof window === 'undefined') return false;

  switch (walletId) {
    case 'gemini':
      return typeof window.ethereum !== 'undefined' && Boolean(window.ethereum.isGemini);
    case 'metamask':
      return typeof window.ethereum !== 'undefined' && Boolean(window.ethereum.isMetaMask);
    case 'coinbase':
      return typeof window.ethereum !== 'undefined' && Boolean(window.ethereum.isCoinbaseWallet);
    case 'rainbow':
      return typeof window.ethereum !== 'undefined' && Boolean(window.ethereum.isRainbow);
    case 'walletconnect':
      // WalletConnect doesn't require installation, works via QR code
      return true;
    case 'phantom':
      return typeof window.ethereum !== 'undefined' && Boolean(window.ethereum.isPhantom);
    default:
      return false;
  }
}

// Format error messages for users
export function formatWalletError(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('user rejected') || message.includes('user denied')) {
    return 'Connection cancelled. Please try again.';
  }
  if (message.includes('chain') || message.includes('network')) {
    return 'Please switch to Polygon network in your wallet.';
  }
  if (message.includes('provider') || message.includes('not found')) {
    return 'Wallet not detected. Please install the wallet extension.';
  }
  if (message.includes('connection')) {
    return 'Failed to connect wallet. Please try again.';
  }

  return 'Failed to connect wallet. Please try again.';
}

// Declare ethereum property on Window for TypeScript
declare global {
  interface Window {
    ethereum?: {
      isGemini?: boolean;
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isRainbow?: boolean;
      isPhantom?: boolean;
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}
