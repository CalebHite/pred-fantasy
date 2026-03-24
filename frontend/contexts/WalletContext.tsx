'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Wallet } from '@/types';
import { mockWalletConnect, mockWalletDisconnect } from '@/lib/wallet/mock-wallet';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { validateNickname } from '@/lib/utils/validation';

interface WalletContextType {
  wallet: Wallet | null;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  setNickname: (nickname: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [storedWallet, setStoredWallet] = useLocalStorage<Wallet | null>(STORAGE_KEYS.WALLET, null);
  const [wallet, setWallet] = useState<Wallet | null>(storedWallet);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync wallet state with localStorage
  useEffect(() => {
    if (wallet) {
      setStoredWallet(wallet);
    }
  }, [wallet, setStoredWallet]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const connectedWallet = await mockWalletConnect();
      setWallet(connectedWallet);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await mockWalletDisconnect();
      setWallet(null);
      setStoredWallet(null);
      setError(null);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    }
  }, [setStoredWallet]);

  const setNickname = useCallback(async (nickname: string) => {
    if (!wallet) {
      throw new Error('No wallet connected');
    }

    const validation = validateNickname(nickname);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Update wallet with nickname
    const updatedWallet = { ...wallet, nickname };
    setWallet(updatedWallet);
    setStoredWallet(updatedWallet);
  }, [wallet, setStoredWallet]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isConnecting,
        error,
        connect,
        disconnect,
        setNickname,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}
