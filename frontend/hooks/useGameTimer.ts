'use client';

import { useState, useEffect } from 'react';
import { getRemainingSeconds } from '@/lib/utils/format';

/**
 * Custom hook for game countdown timer
 * Returns remaining seconds and formatted time
 */
export function useGameTimer(targetDate: Date | string | null) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (!targetDate) return 0;
    return getRemainingSeconds(targetDate);
  });

  useEffect(() => {
    if (!targetDate) {
      setRemainingSeconds(0);
      return;
    }

    // Update immediately
    setRemainingSeconds(getRemainingSeconds(targetDate));

    // Update every second
    const interval = setInterval(() => {
      const seconds = getRemainingSeconds(targetDate);
      setRemainingSeconds(seconds);

      // Stop timer when countdown reaches zero
      if (seconds === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const isExpired = remainingSeconds === 0;

  return {
    remainingSeconds,
    isExpired,
  };
}
