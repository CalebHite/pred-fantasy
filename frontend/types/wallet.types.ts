export type WalletAddress = string;

export interface Wallet {
  address: WalletAddress;
  isConnected: boolean;
  nickname?: string;
  balance?: number;
}

export interface WalletConnectionState {
  wallet: Wallet | null;
  isConnecting: boolean;
  error: string | null;
}
