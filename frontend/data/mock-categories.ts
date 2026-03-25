import { Category } from '@/types';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'nfl-superbowl',
    name: 'NFL',
    description: 'Predict which team will win the Super Bowl',
    type: 'sports',
    icon: '/icons/nfl.svg',
    isActive: true,
  },
  {
    id: 'nba-champion',
    name: 'NBA',
    description: 'Predict the NBA Finals winner',
    type: 'sports',
    icon: '/icons/nba.svg',
    isActive: true,
  },
  {
    id: 'epl-champion',
    name: 'EPL',
    description: 'Predict the Premier League winner',
    type: 'sports',
    icon: '/icons/epl.svg',
    isActive: true,
  },
  {
    id: 'tennis-champion',
    name: 'Tennis',
    description: 'Predict Grand Slam winners',
    type: 'sports',
    icon: '/icons/tennis.svg',
    isActive: true,
  },
  {
    id: 'ncaa-champion',
    name: 'NCAA',
    description: 'Predict March Madness outcomes',
    type: 'sports',
    icon: '🏀',
    isActive: true,
  },
  {
    id: 'btc-price',
    name: 'Bitcoin',
    description: 'Will Bitcoin reach $100,000?',
    type: 'crypto',
    icon: '/icons/Bitcoin (BTC).svg',
    isActive: true,
  },
  {
    id: 'eth-price',
    name: 'Ethereum',
    description: 'Will ETH reach $5,000?',
    type: 'crypto',
    icon: '/icons/Ether (ETH).svg',
    isActive: true,
  },
  {
    id: 'sol-price',
    name: 'Solana',
    description: 'Predict Solana price movements',
    type: 'crypto',
    icon: '/icons/Solana (SOL).svg',
    isActive: true,
  },
  {
    id: 'zec-price',
    name: 'Zcash',
    description: 'Predict Zcash price movements',
    type: 'crypto',
    icon: '/icons/Zcash (ZEC).svg',
    isActive: true,
  },
  {
    id: 'xrp-price',
    name: 'XRP',
    description: 'Predict XRP price movements',
    type: 'crypto',
    icon: '/icons/XRP (XRP).svg',
    isActive: true,
  },
];

/**
 * Get categories by type
 */
export const getCategoriesByType = (type: Category['type']): Category[] => {
  return MOCK_CATEGORIES.filter((cat) => cat.type === type && cat.isActive);
};

/**
 * Get category by ID
 */
export const getCategoryById = (id: string): Category | undefined => {
  return MOCK_CATEGORIES.find((cat) => cat.id === id);
};

/**
 * Get active categories
 */
export const getActiveCategories = (): Category[] => {
  return MOCK_CATEGORIES.filter((cat) => cat.isActive);
};
