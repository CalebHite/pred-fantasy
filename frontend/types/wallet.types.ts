export type WalletAddress = string;

export interface Wallet {
  address: WalletAddress;
  isConnected: boolean;
  nickname?: string;
  balance?: number;
  chainId?: number; // Network chain ID (e.g., 137 for Polygon)
}

export interface WalletConnectionState {
  wallet: Wallet | null;
  isConnecting: boolean;
  error: string | null;
}

// Supported wallet providers
export type SupportedWalletId = 'metamask' | 'coinbase' | 'rainbow' | 'walletconnect' | 'trust' | 'phantom';
