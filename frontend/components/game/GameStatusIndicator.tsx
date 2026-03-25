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

  const getStatusDisplay = () => {
    switch (status) {
      case 'pending':
        return {
          text: 'Pending',
          color: 'text-amber-600',
          bgColor: 'bg-amber-100',
          dotColor: 'bg-amber-500',
          animate: false,
        };
      case 'active':
      case 'live':
        return {
          text: 'Live',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          dotColor: 'bg-red-500',
          animate: true,
        };
      case 'resolving':
        return {
          text: 'Resolving',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          dotColor: 'bg-blue-500',
          animate: true,
        };
      case 'completed':
        return {
          text: 'Completed',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          dotColor: 'bg-green-500',
          animate: false,
        };
      default:
        return {
          text: status,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          dotColor: 'bg-gray-500',
          animate: false,
        };
    }
  };

  const statusInfo = getStatusDisplay();

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full',
        statusInfo.bgColor,
        className
      )}
    >
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

      {/* Status Text */}
      <span className={clsx('text-sm font-medium', statusInfo.color)}>
        {statusInfo.text}
      </span>

      {/* Countdown Timer (for live games) */}
      {(status === 'live' || status === 'active') && countdown > 0 && (
        <>
          <span className={clsx('text-sm font-light', statusInfo.color)}>•</span>
          <span className={clsx('text-sm font-light tabular-nums', statusInfo.color)}>
            {formatCountdown(countdown)}
          </span>
        </>
      )}
    </div>
  );
};
