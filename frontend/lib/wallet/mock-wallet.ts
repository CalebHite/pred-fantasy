import { Wallet } from '@/types';

/**
 * Mock wallet connection for development
 * Simulates connecting to a crypto wallet by generating a random address
 */
export const mockWalletConnect = async (): Promise<Wallet> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Generate mock Ethereum-style address
  const address = `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`;

  return {
    address,
    isConnected: true,
    balance: parseFloat((Math.random() * 10 + 0.5).toFixed(2)), // Random balance between 0.5 and 10.5
  };
};

/**
 * Mock wallet disconnection
 */
export const mockWalletDisconnect = async (): Promise<void> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
};
