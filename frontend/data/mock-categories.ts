import { Category } from '@/types';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'nfl-superbowl',
    name: 'NFL Super Bowl Winner',
    description: 'Predict which team will win the Super Bowl',
    type: 'sports',
    icon: '🏈',
    isActive: true,
  },
  {
    id: 'nba-champion',
    name: 'NBA Championship',
    description: 'Predict the NBA Finals winner',
    type: 'sports',
    icon: '🏀',
    isActive: true,
  },
  {
    id: 'btc-100k',
    name: 'Bitcoin $100K',
    description: 'Will Bitcoin reach $100,000?',
    type: 'crypto',
    icon: '₿',
    isActive: true,
  },
  {
    id: 'eth-price',
    name: 'Ethereum Price',
    description: 'Will ETH reach $5,000?',
    type: 'crypto',
    icon: '⟠',
    isActive: true,
  },
  {
    id: 'oscars-best-picture',
    name: 'Oscars Best Picture',
    description: 'Predict the Best Picture winner',
    type: 'entertainment',
    icon: '🎬',
    isActive: true,
  },
  {
    id: 'box-office',
    name: 'Box Office Leader',
    description: 'Predict the highest-grossing movie',
    type: 'entertainment',
    icon: '🎥',
    isActive: true,
  },
  {
    id: 'us-election',
    name: 'US Presidential Election',
    description: 'Predict the election outcome',
    type: 'politics',
    icon: '🗳️',
    isActive: true,
  },
  {
    id: 'tech-ipo',
    name: 'Next Tech IPO',
    description: 'Predict which tech company goes public',
    type: 'custom',
    icon: '🚀',
    isActive: true,
  },
  {
    id: 'climate-target',
    name: 'Climate Goals',
    description: 'Will emissions targets be met?',
    type: 'custom',
    icon: '🌍',
    isActive: true,
  },
  {
    id: 'ai-milestone',
    name: 'AI Breakthrough',
    description: 'Predict next major AI milestone',
    type: 'custom',
    icon: '🤖',
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
