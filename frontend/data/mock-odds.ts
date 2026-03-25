// Mock time-series odds data for LiveOddsChart

export interface OddsDataPoint {
  timestamp: Date;
  [userId: string]: number | Date; // User IDs map to their odds percentage
}

export interface UserOddsInfo {
  userId: string;
  nickname: string;
  color: string; // Hex color for the line
  address: string;
}

// Mock user information for the chart legend
export const MOCK_ODDS_USERS: UserOddsInfo[] = [
  {
    userId: 'user-1',
    nickname: 'CryptoKing',
    color: '#FF6B35', // Orange
    address: '0x1234567890abcdef1234567890abcdef12345678',
  },
  {
    userId: 'user-2',
    nickname: 'SportsFan',
    color: '#00D9FF', // Cyan
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
  },
  {
    userId: 'user-3',
    nickname: 'Predictor',
    color: '#9D4EDD', // Purple
    address: '0x567890abcdef1234567890abcdef1234567890ab',
  },
  {
    userId: 'user-4',
    nickname: 'GameMaster',
    color: '#06FFA5', // Green
    address: '0xcdef1234567890abcdef1234567890abcdef1234',
  },
];

// Generate mock time-series data (last 7 days, hourly intervals)
const generateOddsHistory = (): OddsDataPoint[] => {
  const now = new Date();
  const data: OddsDataPoint[] = [];
  const hoursToGenerate = 24 * 7; // 7 days

  for (let i = hoursToGenerate; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);

    const dataPoint: OddsDataPoint = {
      timestamp,
      'user-1': Math.max(10, Math.min(90, 45 + Math.sin(i / 10) * 20 + Math.random() * 10)),
      'user-2': Math.max(10, Math.min(90, 55 + Math.cos(i / 8) * 15 + Math.random() * 10)),
      'user-3': Math.max(10, Math.min(90, 35 + Math.sin(i / 12) * 25 + Math.random() * 10)),
      'user-4': Math.max(10, Math.min(90, 50 + Math.cos(i / 15) * 20 + Math.random() * 10)),
    };

    data.push(dataPoint);
  }

  return data;
};

export const MOCK_ODDS_HISTORY = generateOddsHistory();

// Helper function to get odds for a specific user
export const getOddsForUser = (userId: string): { timestamp: Date; odds: number }[] => {
  return MOCK_ODDS_HISTORY.map((point) => ({
    timestamp: point.timestamp,
    odds: point[userId] as number,
  }));
};

// Helper function to get user info by ID
export const getUserOddsInfo = (userId: string): UserOddsInfo | undefined => {
  return MOCK_ODDS_USERS.find((user) => user.userId === userId);
};
