import { format, formatDistanceToNow, differenceInSeconds } from 'date-fns';

/**
 * Format a date to a readable string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d, yyyy h:mm a');
};

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * Format a wallet address for display (shortened)
 * Shows first 9 characters followed by "..."
 */
export const formatAddress = (address: string, short = false): string => {
  if (address.length < 12) return address;

  // Short format: 0x + first 6 chars + ... + last 4
  if (short) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Long format (for user profile): 0x + first 7 chars + ...
  return `${address.slice(0, 9)}...`;
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  if (currency === 'USD') {
    return `$${amount.toFixed(2)}`;
  }
  return `${amount.toFixed(4)} ${currency}`;
};

/**
 * Format countdown time (hours:minutes:seconds)
 */
export const formatCountdown = (seconds: number): string => {
  if (seconds < 0) return '00:00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map(val => val.toString().padStart(2, '0'))
    .join(':');
};

/**
 * Get remaining seconds until a date
 */
export const getRemainingSeconds = (targetDate: Date | string): number => {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  return Math.max(0, differenceInSeconds(target, new Date()));
};
