'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Game, GameCode, GameId } from '@/types';
import { useWallet } from './WalletContext';
import {
  fetchGame as apiFetchGame,
  fetchGames as apiFetchGames,
  createGame as apiCreateGame,
  joinGame as apiJoinGame,
  ApiGame,
} from '@/lib/api/client';

/** Map an API game response to the frontend Game shape. */
function toGame(g: ApiGame): Game {
  return {
    id: g.id,
    code: g.code,
    host: g.hostAddress,
    config: {
      buyInAmount: g.buyInAmount,
      categories: g.events.map((e) => e.eventTicker),
      maxParticipants: g.maxParticipants ?? undefined,
      resolutionTime: new Date(g.resolutionTime),
      rules: g.rules ?? undefined,
    },
    participants: g.participants.map((p) => ({
      address: p.walletAddress,
      nickname: p.nickname,
      joinedAt: new Date(p.joinedAt),
      hasPaid: p.hasPaid,
    })),
    status: g.status as Game['status'],
    createdAt: new Date(g.createdAt),
    startedAt: g.startedAt ? new Date(g.startedAt) : undefined,
    resolvedAt: g.resolvedAt ? new Date(g.resolvedAt) : undefined,
  };
}

interface CreateGameInput {
  buyInAmount: number;
  maxParticipants?: number;
  resolutionTime: Date;
  rules?: string;
  categories?: { categoryKey: string; categoryName: string; categoryType: string }[];
  events?: { ticker: string; title: string; type: string }[];
}

interface GameContextType {
  currentGame: Game | null;
  games: Game[];
  isLoading: boolean;
  createGame: (input: CreateGameInput) => Promise<Game>;
  joinGame: (gameCode: GameCode) => Promise<Game>;
  leaveGame: (gameId: GameId) => Promise<void>;
  loadGame: (gameId: GameId) => Promise<void>;
  refreshGames: () => Promise<void>;
  setCurrentGame: (game: Game | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { wallet } = useWallet();
  const [games, setGames] = useState<Game[]>([]);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshGames = useCallback(async () => {
    try {
      const apiGames = await apiFetchGames();
      setGames(apiGames.map(toGame));
    } catch {
      // silently fail — games list is non-critical
    }
  }, []);

  const createGame = useCallback(
    async (input: CreateGameInput): Promise<Game> => {
      if (!wallet) throw new Error('Wallet not connected');

      setIsLoading(true);
      try {
        const apiGame = await apiCreateGame({
          hostAddress: wallet.address,
          buyInAmount: input.buyInAmount,
          maxParticipants: input.maxParticipants,
          resolutionTime: input.resolutionTime.toISOString(),
          rules: input.rules,
          categories: input.categories,
          events: input.events,
        });

        const game = toGame(apiGame);
        setGames((prev) => [...prev, game]);
        setCurrentGame(game);
        return game;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet]
  );

  const joinGame = useCallback(
    async (gameCode: GameCode): Promise<Game> => {
      if (!wallet) throw new Error('Wallet not connected');

      setIsLoading(true);
      try {
        // First find the game by code so we have its ID
        const allGames = await apiFetchGames();
        const target = allGames.find((g) => g.code === gameCode.toUpperCase());
        if (!target) throw new Error('Game not found');

        const apiGame = await apiJoinGame(target.id, {
          walletAddress: wallet.address,
          nickname: wallet.nickname || 'Anonymous',
        });

        const game = toGame(apiGame);
        setGames((prev) => {
          const idx = prev.findIndex((g) => g.id === game.id);
          return idx >= 0 ? prev.map((g) => (g.id === game.id ? game : g)) : [...prev, game];
        });
        setCurrentGame(game);
        return game;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet]
  );

  const leaveGame = useCallback(
    async (gameId: GameId): Promise<void> => {
      // For now, just clear local state — no leave endpoint yet
      setCurrentGame((prev) => (prev?.id === gameId ? null : prev));
    },
    []
  );

  const loadGame = useCallback(
    async (gameId: GameId): Promise<void> => {
      setIsLoading(true);
      try {
        const apiGame = await apiFetchGame(gameId);
        const game = toGame(apiGame);
        setGames((prev) => {
          const idx = prev.findIndex((g) => g.id === game.id);
          return idx >= 0 ? prev.map((g) => (g.id === game.id ? game : g)) : [...prev, game];
        });
        setCurrentGame(game);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <GameContext.Provider
      value={{
        currentGame,
        games,
        isLoading,
        createGame,
        joinGame,
        leaveGame,
        loadGame,
        refreshGames,
        setCurrentGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
