/**
 * App-wide constants
 */

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Fantasy Prediction Markets';

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Feature flags
export const ENABLE_REAL_WALLET = process.env.NEXT_PUBLIC_ENABLE_REAL_WALLET === 'true';
export const ENABLE_BACKEND_API = process.env.NEXT_PUBLIC_ENABLE_BACKEND_API === 'true';
export const MOCK_WALLET_ENABLED = process.env.NEXT_PUBLIC_MOCK_WALLET_ENABLED !== 'false';

// Game defaults
export const DEFAULT_BUY_IN = 10;
export const DEFAULT_MAX_PARTICIPANTS = 10;
export const MIN_CATEGORIES_REQUIRED = 2;
export const MAX_CATEGORIES_ALLOWED = 10;

// LocalStorage keys
export const STORAGE_KEYS = {
  WALLET: 'pred-fantasy-wallet',
  GAMES: 'pred-fantasy-games',
  CURRENT_GAME: 'pred-fantasy-current-game',
} as const;
