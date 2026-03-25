'use client';

import { useEffect, useState } from 'react';
import { formatCountdown } from '@/lib/utils/format';
import clsx from 'clsx';

interface GameStatusIndicatorProps {
  status: 'pending' | 'active' | 'live' | 'resolving' | 'completed';
  timeRemaining?: number; // Time remaining in seconds (for live games)
  className?: string;
}

export const GameStatusIndicator = ({
  status,
  timeRemaining,
  className,
}: GameStatusIndicatorProps) => {
  const [countdown, setCountdown] = useState(timeRemaining || 0);

  useEffect(() => {
    if (status === 'live' && timeRemaining) {
      setCountdown(timeRemaining);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status, timeRemaining]);

  // Always show "Live" with red color
  const statusInfo = {
    text: 'Live',
    color: 'text-red-600',
    dotColor: 'bg-red-600',
    lineColor: 'bg-red-600',
    animate: true,
  };

  return (
    <div className={clsx('inline-flex items-center gap-3', className)}>
      {/* Left Line */}
      <div className={clsx('h-0.5 w-16', statusInfo.lineColor)} />

      {/* Status Content */}
      <div className="inline-flex items-center gap-2">
        {/* Status Text */}
        <span className={clsx('text-sm font-medium', statusInfo.color)}>
          {statusInfo.text}
        </span>

        {/* Pulsing Dot */}
        <div className="relative flex items-center justify-center">
          {statusInfo.animate && (
            <span
              className={clsx(
                'absolute inline-flex h-3 w-3 rounded-full opacity-75 animate-ping',
                statusInfo.dotColor
              )}
            />
          )}
          <span
            className={clsx(
              'relative inline-flex h-2 w-2 rounded-full',
              statusInfo.dotColor
            )}
          />
        </div>

        {/* Countdown Timer */}
        <span className={clsx('text-sm !font-light tabular-nums', statusInfo.color)} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
          {countdown > 0 ? formatCountdown(countdown) : '00:00:00'}
        </span>
      </div>

      {/* Right Line */}
      <div className={clsx('h-0.5 w-16', statusInfo.lineColor)} />
    </div>
  );
};
