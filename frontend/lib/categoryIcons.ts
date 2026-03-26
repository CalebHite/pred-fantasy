/**
 * Maps category keys to their icon paths in /public/icons/.
 */
const CATEGORY_ICON_MAP: Record<string, string> = {
  'btc-markets': '/icons/Bitcoin (BTC).svg',
  'eth-markets': '/icons/Ether (ETH).svg',
  'sol-markets': '/icons/Solana (SOL).svg',
  'xrp-markets': '/icons/XRP (XRP).svg',
  'nba-games': '/icons/nba.svg',
  'nfl-games': '/icons/nfl.svg',
  'mlb-games': '/icons/mlb.png',
  'epl-games': '/icons/epl.svg',
  'ncaa-mbb': '/icons/ncaa.svg',
};

const LARGER_ICONS = new Set(['nba-games', 'mlb-games']);

export function getCategoryIcon(categoryKey: string): string {
  return CATEGORY_ICON_MAP[categoryKey] || '/icons/swords.svg';
}

export function getCategoryIconSize(categoryKey: string): number {
  return LARGER_ICONS.has(categoryKey) ? 64 : 40;
}
