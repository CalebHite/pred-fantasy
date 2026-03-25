'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { Wallet } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS, ENABLE_REAL_WALLET } from '@/lib/utils/constants';
import { validateNickname } from '@/lib/utils/validation';
import { getConnectorByWalletId, formatWalletError } from '@/lib/wallet/real-wallet';
import { mockWalletConnect, mockWalletDisconnect } from '@/lib/wallet/mock-wallet';
import { SUPPORTED_CHAIN_ID } from '@/lib/wallet/web3-config';

interface WalletContextType {
  wallet: Wallet | null;
  isConnecting: boolean;
  error: string | null;
  selectedWalletId: string | null;
  connect: (walletId: string) => Promise<void>;
  disconnect: () => void;
  setNickname: (nickname: string) => Promise<void>;
  switchToPolygon: () => Promise<void>;
  isOnWrongNetwork: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  // Wagmi hooks
  const { address, isConnected, connector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  // Local state
  const [storedNickname, setStoredNickname] = useLocalStorage<string | null>(
    STORAGE_KEYS.WALLET_NICKNAME,
    null
  );
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  // Check if on wrong network (always correct in mock mode)
  const isOnWrongNetwork = ENABLE_REAL_WALLET && isConnected && chainId !== SUPPORTED_CHAIN_ID;

  // Sync wallet state with wagmi account state (only for real wallet)
  useEffect(() => {
    if (!ENABLE_REAL_WALLET) {
      // In mock mode, wallet state is managed directly in connect/disconnect
      return;
    }

    if (isConnected && address) {
      setWallet({
        address,
        isConnected: true,
        nickname: storedNickname || undefined,
        balance: balanceData ? parseFloat(balanceData.formatted) : undefined,
        chainId,
      });
    } else {
      setWallet(null);
    }
  }, [isConnected, address, storedNickname, balanceData, chainId]);

  const connect = useCallback(
    async (walletId: string) => {
      setIsConnecting(true);
      setError(null);
      setSelectedWalletId(walletId);

      try {
        if (!ENABLE_REAL_WALLET) {
          // Use mock wallet
          const mockWallet = await mockWalletConnect();
          setWallet(mockWallet);
        } else {
          // Find connector
          const connector = getConnectorByWalletId(connectors, walletId);
          if (!connector) {
            throw new Error('Wallet connector not found');
          }

          // Connect
          await connectAsync({ connector, chainId: SUPPORTED_CHAIN_ID });

          // Success - wallet state will be updated by useEffect
        }
      } catch (err) {
        const errorMessage = formatWalletError(err as Error);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsConnecting(false);
      }
    },
    [connectAsync, connectors]
  );

  const disconnect = useCallback(async () => {
    try {
      if (!ENABLE_REAL_WALLET) {
        // Use mock wallet disconnect
        await mockWalletDisconnect();
      } else {
        await disconnectAsync();
      }
      setWallet(null);
      setStoredNickname(null);
      setError(null);
      setSelectedWalletId(null);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    }
  }, [disconnectAsync, setStoredNickname]);

  const setNickname = useCallback(
    async (nickname: string) => {
      if (!wallet) {
        throw new Error('No wallet connected');
      }

      const validation = validateNickname(nickname);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Update local state
      const updatedWallet = { ...wallet, nickname };
      setWallet(updatedWallet);
      setStoredNickname(nickname);
    },
    [wallet, setStoredNickname]
  );

  const switchToPolygon = useCallback(async () => {
    if (!ENABLE_REAL_WALLET) {
      // Mock mode - always on correct network
      return;
    }

    try {
      await switchChainAsync({ chainId: SUPPORTED_CHAIN_ID });
      setError(null);
    } catch (err) {
      const errorMessage =
        'Failed to switch network. Please manually switch to Polygon in your wallet.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [switchChainAsync]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isConnecting,
        error,
        selectedWalletId,
        connect,
        disconnect,
        setNickname,
        switchToPolygon,
        isOnWrongNetwork,
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
