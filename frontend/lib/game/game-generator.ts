import { GameCode, GameId } from '@/types';

/**
 * Generate a random 7-character game code (uppercase alphanumeric)
 * Format: XXXXXXX (e.g., PRED2025, ABC123X)
 */
export const generateGameCode = (): GameCode => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }

  return code as GameCode;
};

/**
 * Generate a unique game ID (UUID-like)
 */
export const generateGameId = (): GameId => {
  return `game-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` as GameId;
};

/**
 * Validate a game code format
 * Must be exactly 7 alphanumeric characters
 */
export const isValidGameCode = (code: string): boolean => {
  if (!code || typeof code !== 'string') {
    return false;
  }

  const trimmedCode = code.trim();

  // Must be exactly 7 characters
  if (trimmedCode.length !== 7) {
    return false;
  }

  // Must be alphanumeric only
  const alphanumericPattern = /^[A-Z0-9]{7}$/;
  return alphanumericPattern.test(trimmedCode.toUpperCase());
};

/**
 * Format a game code to uppercase
 */
export const formatGameCode = (code: string): GameCode => {
  return code.toUpperCase().trim() as GameCode;
};
