export type GameCode = string;
export type GameId = string;

/**
 * Generate a random game code (6 characters)
 * Uses characters that are easy to read and share
 */
export const generateGameCode = (): GameCode => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes similar-looking characters (I, O, 0, 1)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

/**
 * Generate a unique game ID
 */
export const generateGameId = (): GameId => {
  return `game-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

/**
 * Validate game code format
 */
export const isValidGameCode = (code: string): boolean => {
  const validChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;
  return validChars.test(code);
};
