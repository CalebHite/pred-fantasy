import { CategoryId } from '@/types';

export interface Strike {
  id: string;
  label: string;
  odds?: string;
}

export interface MarketStrikes {
  categoryId: CategoryId;
  categoryName: string;
  strikes: Strike[];
}

/**
 * Mock strikes for each prediction market
 */
export const MOCK_STRIKES: Record<string, MarketStrikes> = {
  'nfl-superbowl': {
    categoryId: 'nfl-superbowl',
    categoryName: 'NFL Super Bowl Winner',
    strikes: [
      { id: 'chiefs', label: 'Kansas City Chiefs', odds: '+350' },
      { id: '49ers', label: 'San Francisco 49ers', odds: '+400' },
      { id: 'ravens', label: 'Baltimore Ravens', odds: '+500' },
      { id: 'bills', label: 'Buffalo Bills', odds: '+800' },
      { id: 'lions', label: 'Detroit Lions', odds: '+900' },
      { id: 'eagles', label: 'Philadelphia Eagles', odds: '+1000' },
    ],
  },
  'nba-champion': {
    categoryId: 'nba-champion',
    categoryName: 'NBA Championship',
    strikes: [
      { id: 'celtics', label: 'Boston Celtics', odds: '+300' },
      { id: 'nuggets', label: 'Denver Nuggets', odds: '+400' },
      { id: 'bucks', label: 'Milwaukee Bucks', odds: '+500' },
      { id: 'suns', label: 'Phoenix Suns', odds: '+700' },
      { id: 'lakers', label: 'Los Angeles Lakers', odds: '+900' },
      { id: 'warriors', label: 'Golden State Warriors', odds: '+1200' },
    ],
  },
  'btc-100k': {
    categoryId: 'btc-100k',
    categoryName: 'Bitcoin $100K',
    strikes: [
      { id: 'yes-q1', label: 'Yes, by Q1 2026', odds: '+200' },
      { id: 'yes-q2', label: 'Yes, by Q2 2026', odds: '+150' },
      { id: 'yes-q3', label: 'Yes, by Q3 2026', odds: '+120' },
      { id: 'yes-q4', label: 'Yes, by Q4 2026', odds: '+100' },
      { id: 'no-2026', label: 'No, not in 2026', odds: '+300' },
    ],
  },
  'eth-price': {
    categoryId: 'eth-price',
    categoryName: 'Ethereum Price',
    strikes: [
      { id: 'above-5k', label: 'Above $5,000', odds: '+150' },
      { id: '4k-5k', label: '$4,000 - $5,000', odds: '+200' },
      { id: '3k-4k', label: '$3,000 - $4,000', odds: '+250' },
      { id: 'below-3k', label: 'Below $3,000', odds: '+400' },
    ],
  },
  'oscars-best-picture': {
    categoryId: 'oscars-best-picture',
    categoryName: 'Oscars Best Picture',
    strikes: [
      { id: 'oppenheimer', label: 'Oppenheimer', odds: '+120' },
      { id: 'killers', label: 'Killers of the Flower Moon', odds: '+300' },
      { id: 'barbie', label: 'Barbie', odds: '+500' },
      { id: 'maestro', label: 'Maestro', odds: '+800' },
      { id: 'past-lives', label: 'Past Lives', odds: '+1000' },
      { id: 'zone', label: 'Zone of Interest', odds: '+1500' },
    ],
  },
  'box-office': {
    categoryId: 'box-office',
    categoryName: 'Box Office Leader',
    strikes: [
      { id: 'avatar-3', label: 'Avatar 3', odds: '+200' },
      { id: 'avengers', label: 'Avengers: Secret Wars', odds: '+150' },
      { id: 'superman', label: 'Superman (2025)', odds: '+400' },
      { id: 'toy-story-5', label: 'Toy Story 5', odds: '+500' },
      { id: 'other', label: 'Other Film', odds: '+800' },
    ],
  },
  'us-election': {
    categoryId: 'us-election',
    categoryName: 'US Presidential Election',
    strikes: [
      { id: 'democrat', label: 'Democratic Candidate', odds: '+180' },
      { id: 'republican', label: 'Republican Candidate', odds: '+200' },
      { id: 'independent', label: 'Independent Candidate', odds: '+1000' },
    ],
  },
  'tech-ipo': {
    categoryId: 'tech-ipo',
    categoryName: 'Next Tech IPO',
    strikes: [
      { id: 'stripe', label: 'Stripe', odds: '+300' },
      { id: 'spacex', label: 'SpaceX', odds: '+500' },
      { id: 'databricks', label: 'Databricks', odds: '+400' },
      { id: 'discord', label: 'Discord', odds: '+600' },
      { id: 'canva', label: 'Canva', odds: '+700' },
      { id: 'other', label: 'Other Company', odds: '+200' },
    ],
  },
  'climate-target': {
    categoryId: 'climate-target',
    categoryName: 'Climate Goals',
    strikes: [
      { id: 'yes-met', label: 'Yes, targets will be met', odds: '+500' },
      { id: 'partially', label: 'Partially met (50-90%)', odds: '+200' },
      { id: 'no-met', label: 'No, targets missed', odds: '+150' },
    ],
  },
  'ai-milestone': {
    categoryId: 'ai-milestone',
    categoryName: 'AI Breakthrough',
    strikes: [
      { id: 'agi', label: 'AGI announcement by major lab', odds: '+800' },
      { id: 'gpt5', label: 'GPT-5 or equivalent release', odds: '+300' },
      { id: 'quantum-ai', label: 'Quantum AI breakthrough', odds: '+1000' },
      { id: 'robotics', label: 'Humanoid robot in production', odds: '+400' },
      { id: 'other', label: 'Other major milestone', odds: '+500' },
    ],
  },
};

/**
 * Get strikes for a specific category
 */
export const getStrikesForCategory = (categoryId: string): MarketStrikes | undefined => {
  return MOCK_STRIKES[categoryId];
};
