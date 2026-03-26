import { GeminiEvent } from '../types/gemini.types';
import { listEvents } from './gemini/markets';

export interface CategoryMatchingRules {
  type: 'ticker_contains' | 'category_equals' | 'series_equals' | 'tags_contains';
  values: string[];
  description: string;
}

export interface GameCategory {
  key: string;
  name: string;
  type: 'crypto' | 'sports' | 'politics' | 'entertainment';
  description: string;
  icon?: string;
  matchingRules: CategoryMatchingRules;
}

/**
 * Asset-specific category definitions
 * These categories are used for game creation and market organization
 */
const CATEGORY_REGISTRY: GameCategory[] = [
  // Crypto categories
  {
    key: 'btc-markets',
    name: 'BTC Markets',
    type: 'crypto',
    description: 'Bitcoin prediction markets',
    icon: '/icons/Bitcoin (BTC).svg',
    matchingRules: {
      type: 'ticker_contains',
      values: ['BTC', 'BITCOIN'],
      description: 'Events with BTC or BITCOIN in ticker'
    }
  },
  {
    key: 'eth-markets',
    name: 'ETH Markets',
    type: 'crypto',
    description: 'Ethereum prediction markets',
    icon: '/icons/Ether (ETH).svg',
    matchingRules: {
      type: 'ticker_contains',
      values: ['ETH', 'ETHEREUM'],
      description: 'Events with ETH or ETHEREUM in ticker'
    }
  },
  {
    key: 'sol-markets',
    name: 'SOL Markets',
    type: 'crypto',
    description: 'Solana prediction markets',
    icon: '/icons/Solana (SOL).svg',
    matchingRules: {
      type: 'ticker_contains',
      values: ['SOL', 'SOLANA'],
      description: 'Events with SOL or SOLANA in ticker'
    }
  },
  {
    key: 'xrp-markets',
    name: 'XRP Markets',
    type: 'crypto',
    description: 'XRP prediction markets',
    icon: '/icons/XRP (XRP).svg',
    matchingRules: {
      type: 'ticker_contains',
      values: ['XRP', 'RIPPLE'],
      description: 'Events with XRP or RIPPLE in ticker'
    }
  },

  // Sports categories
  {
    key: 'nba-games',
    name: 'NBA Games',
    type: 'sports',
    description: 'NBA prediction markets',
    icon: '/icons/nba.svg',
    matchingRules: {
      type: 'tags_contains',
      values: ['nba'],
      description: 'Events tagged with NBA'
    }
  },
  {
    key: 'nfl-games',
    name: 'NFL Games',
    type: 'sports',
    description: 'NFL prediction markets',
    icon: '/icons/nfl.svg',
    matchingRules: {
      type: 'tags_contains',
      values: ['nfl', 'football'],
      description: 'Events tagged with NFL or football'
    }
  },
  {
    key: 'mlb-games',
    name: 'MLB Games',
    type: 'sports',
    description: 'MLB prediction markets',
    icon: '/icons/mlb.png',
    matchingRules: {
      type: 'tags_contains',
      values: ['mlb', 'baseball'],
      description: 'Events tagged with MLB or baseball'
    }
  },
  {
    key: 'epl-games',
    name: 'Premier League',
    type: 'sports',
    description: 'English Premier League prediction markets',
    icon: '/icons/epl.svg',
    matchingRules: {
      type: 'tags_contains',
      values: ['epl', 'premier league', 'english premier league'],
      description: 'Events tagged with EPL or Premier League'
    }
  },
  {
    key: 'ncaa-mbb',
    name: 'NCAA MBB',
    type: 'sports',
    description: 'NCAA Men\'s Basketball markets',
    icon: '/icons/ncaa.svg',
    matchingRules: {
      type: 'tags_contains',
      values: ['ncaa', 'college basketball'],
      description: 'Events tagged with NCAA or college basketball'
    }
  },
];

/**
 * Get all available categories
 */
export function getAvailableCategories(): GameCategory[] {
  return CATEGORY_REGISTRY;
}

/**
 * Get category by key
 */
export function getCategoryByKey(key: string): GameCategory | undefined {
  return CATEGORY_REGISTRY.find(cat => cat.key === key);
}

/**
 * Check if an event matches a category's criteria
 */
export function eventMatchesCategory(event: GeminiEvent, category: GameCategory): boolean {
  const { matchingRules } = category;

  switch (matchingRules.type) {
    case 'ticker_contains':
      return matchingRules.values.some(val =>
        event.ticker.toUpperCase().includes(val.toUpperCase())
      );

    case 'category_equals':
      return matchingRules.values.some(val =>
        event.category.toLowerCase() === val.toLowerCase()
      );

    case 'series_equals':
      return matchingRules.values.some(val =>
        event.series?.toLowerCase() === val.toLowerCase()
      );

    case 'tags_contains':
      return event.tags.some(tag =>
        matchingRules.values.some(val =>
          tag.toLowerCase().includes(val.toLowerCase())
        )
      );

    default:
      return false;
  }
}

/**
 * Get all active events for a category
 */
export async function getEventsForCategory(categoryKey: string): Promise<GeminiEvent[]> {
  const category = getCategoryByKey(categoryKey);
  if (!category) {
    throw new Error(`Category not found: ${categoryKey}`);
  }

  // Fetch active events from Gemini
  const response = await listEvents({
    status: ['active', 'approved'],
    limit: 100
  });

  // Filter events that match category criteria
  return response.data.filter(event => eventMatchesCategory(event, category));
}

/**
 * Validate that an event belongs to a category
 */
export async function validateEventInCategory(
  eventTicker: string,
  categoryKey: string
): Promise<boolean> {
  const category = getCategoryByKey(categoryKey);
  if (!category) return false;

  try {
    const events = await getEventsForCategory(categoryKey);
    return events.some(event => event.ticker === eventTicker);
  } catch {
    return false;
  }
}
