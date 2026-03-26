// Mock scoreboard data for Scoreboard component

export interface PositionDetail {
  contractLabel: string; // e.g. "Kansas City Chiefs"
  entryPrice: number; // Price when bought (0-1 scale, e.g. 0.67)
  currentPrice: number; // Current price (0-1 scale)
  pnl: number; // currentPrice - entryPrice
  pnlPercent: number; // (currentPrice - entryPrice) / entryPrice * 100
}

export interface ScoreboardEntry {
  userId: string;
  nickname: string;
  address: string;
  score: number; // Current score (e.g., number of correct predictions, points, etc.)
  rank: number; // Current rank in the game (1 = first place)
  avatar?: string; // Optional avatar URL
  color?: string; // Optional color for visual distinction
  avgOdds?: number; // Average contract price across picks (0-1 scale, e.g. 0.67 = 67%)
  numPicks?: number; // Number of predictions made
  totalCost?: number; // Sum of entry prices (cost basis)
  totalValue?: number; // Sum of current contract prices
  pnl?: number; // totalValue - totalCost
  positions?: PositionDetail[]; // Individual position details
}

// Mock scoreboard data (sorted by rank)
export const MOCK_SCOREBOARD: ScoreboardEntry[] = [
  {
    userId: 'user-1',
    nickname: 'CryptoKing',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    score: 87,
    rank: 1,
    color: '#FF6B35', // Orange
  },
  {
    userId: 'user-2',
    nickname: 'SportsFan',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    score: 75,
    rank: 2,
    color: '#00D9FF', // Cyan
  },
  {
    userId: 'user-3',
    nickname: 'Predictor',
    address: '0x567890abcdef1234567890abcdef1234567890ab',
    score: 68,
    rank: 3,
    color: '#9D4EDD', // Purple
  },
  {
    userId: 'user-4',
    nickname: 'GameMaster',
    address: '0xcdef1234567890abcdef1234567890abcdef1234',
    score: 52,
    rank: 4,
    color: '#06FFA5', // Green
  },
  {
    userId: 'user-5',
    nickname: 'Newbie',
    address: '0xef1234567890abcdef1234567890abcdef123456',
    score: 41,
    rank: 5,
    color: '#FFB700', // Yellow
  },
];

// Helper function to get user rank by ID
export const getUserRank = (userId: string): number | undefined => {
  const entry = MOCK_SCOREBOARD.find((e) => e.userId === userId);
  return entry?.rank;
};

// Helper function to get user score by ID
export const getUserScore = (userId: string): number | undefined => {
  const entry = MOCK_SCOREBOARD.find((e) => e.userId === userId);
  return entry?.score;
};

// Helper function to get top N players
export const getTopPlayers = (n: number): ScoreboardEntry[] => {
  return MOCK_SCOREBOARD.slice(0, n);
};
