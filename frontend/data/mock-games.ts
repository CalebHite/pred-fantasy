import { Game } from '@/types';

/**
 * Mock game data for development/testing
 */
export const MOCK_GAME: Game = {
  id: 'game-demo-123',
  code: 'PRED26',
  host: '0x1234567890abcdef1234567890abcdef12345678',
  config: {
    buyInAmount: 20,
    categories: ['nfl-superbowl', 'btc-100k', 'oscars-best-picture'],
    maxParticipants: 10,
    resolutionTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    rules: 'Winner takes all. Most correct predictions wins.',
  },
  participants: [
    {
      address: '0x1234567890abcdef1234567890abcdef12345678',
      nickname: 'CryptoKing',
      joinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      hasPaid: true,
    },
    {
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      nickname: 'PredictorPro',
      joinedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      hasPaid: true,
    },
    {
      address: '0x7890abcdef1234567890abcdef1234567890abcd',
      nickname: 'MarketMaster',
      joinedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      hasPaid: true,
    },
  ],
  status: 'active',
  createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
};
