'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Game, GameConfig, GameCode, GameId, Participant } from '@/types';
import { generateGameCode, generateGameId } from '@/lib/game/game-generator';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useWallet } from './WalletContext';

interface GameContextType {
  currentGame: Game | null;
  games: Game[];
  isLoading: boolean;
  createGame: (config: GameConfig) => Promise<Game>;
  joinGame: (gameCode: GameCode) => Promise<void>;
  leaveGame: (gameId: GameId) => Promise<void>;
  updateGameConfig: (gameId: GameId, config: Partial<GameConfig>) => Promise<void>;
  loadGame: (gameId: GameId) => Promise<void>;
  setCurrentGame: (game: Game | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { wallet } = useWallet();
  const [games, setGames] = useLocalStorage<Game[]>(STORAGE_KEYS.GAMES, []);
  const [currentGameId, setCurrentGameId] = useLocalStorage<string | null>(STORAGE_KEYS.CURRENT_GAME, null);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load current game when currentGameId changes
  useEffect(() => {
    if (currentGameId) {
      const game = games.find((g) => g.id === currentGameId);
      setCurrentGame(game || null);
    } else {
      setCurrentGame(null);
    }
  }, [currentGameId, games]);

  const createGame = useCallback(
    async (config: GameConfig): Promise<Game> => {
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);

      try {
        // Create new game
        const game: Game = {
          id: generateGameId(),
          code: generateGameCode(),
          host: wallet.address,
          config,
          participants: [
            {
              address: wallet.address,
              nickname: wallet.nickname || 'Anonymous',
              joinedAt: new Date(),
              hasPaid: true,
            },
          ],
          status: 'pending',
          createdAt: new Date(),
        };

        // Save game
        setGames((prev) => [...prev, game]);
        setCurrentGameId(game.id);
        setCurrentGame(game);

        return game;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, setGames, setCurrentGameId]
  );

  const joinGame = useCallback(
    async (gameCode: GameCode): Promise<void> => {
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);

      try {
        // Find game by code
        const game = games.find((g) => g.code === gameCode);
        if (!game) {
          throw new Error('Game not found');
        }

        // Check if already joined
        if (game.participants.some((p) => p.address === wallet.address)) {
          setCurrentGameId(game.id);
          return;
        }

        // Check max participants
        if (game.config.maxParticipants && game.participants.length >= game.config.maxParticipants) {
          throw new Error('Game is full');
        }

        // Add participant
        const participant: Participant = {
          address: wallet.address,
          nickname: wallet.nickname || 'Anonymous',
          joinedAt: new Date(),
          hasPaid: true,
        };

        const updatedGame = {
          ...game,
          participants: [...game.participants, participant],
        };

        // Update games
        setGames((prev) => prev.map((g) => (g.id === game.id ? updatedGame : g)));
        setCurrentGameId(game.id);
        setCurrentGame(updatedGame);
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, games, setGames, setCurrentGameId]
  );

  const leaveGame = useCallback(
    async (gameId: GameId): Promise<void> => {
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);

      try {
        const game = games.find((g) => g.id === gameId);
        if (!game) {
          throw new Error('Game not found');
        }

        // Remove participant
        const updatedGame = {
          ...game,
          participants: game.participants.filter((p) => p.address !== wallet.address),
        };

        setGames((prev) => prev.map((g) => (g.id === gameId ? updatedGame : g)));

        if (currentGameId === gameId) {
          setCurrentGameId(null);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, games, currentGameId, setGames, setCurrentGameId]
  );

  const updateGameConfig = useCallback(
    async (gameId: GameId, config: Partial<GameConfig>): Promise<void> => {
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);

      try {
        const game = games.find((g) => g.id === gameId);
        if (!game) {
          throw new Error('Game not found');
        }

        // Check if user is host
        if (game.host !== wallet.address) {
          throw new Error('Only the host can update game config');
        }

        const updatedGame = {
          ...game,
          config: { ...game.config, ...config },
        };

        setGames((prev) => prev.map((g) => (g.id === gameId ? updatedGame : g)));

        if (currentGameId === gameId) {
          setCurrentGame(updatedGame);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, games, currentGameId, setGames]
  );

  const loadGame = useCallback(
    async (gameId: GameId): Promise<void> => {
      setIsLoading(true);

      try {
        const game = games.find((g) => g.id === gameId);
        if (!game) {
          throw new Error('Game not found');
        }

        setCurrentGameId(gameId);
        setCurrentGame(game);
      } finally {
        setIsLoading(false);
      }
    },
    [games, setCurrentGameId]
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
        updateGameConfig,
        loadGame,
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
