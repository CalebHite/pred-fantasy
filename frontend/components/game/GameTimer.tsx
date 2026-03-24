'use client';

import { useGameTimer } from '@/hooks/useGameTimer';
import { formatCountdown } from '@/lib/utils/format';
import clsx from 'clsx';

interface GameTimerProps {
  resolutionTime: Date | string;
  className?: string;
}

export function GameTimer({ resolutionTime, className }: GameTimerProps) {
  const { remainingSeconds, isExpired } = useGameTimer(resolutionTime);

  const totalSeconds = typeof resolutionTime === 'string'
    ? Math.floor((new Date(resolutionTime).getTime() - new Date().getTime() + remainingSeconds * 1000) / 1000)
    : Math.floor((resolutionTime.getTime() - new Date().getTime() + remainingSeconds * 1000) / 1000);

  const progressPercentage = totalSeconds > 0
    ? Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100))
    : 0;

  return (
    <div className={clsx('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Time Remaining</span>
        <span className={clsx(
          'text-sm font-medium',
          isExpired ? 'text-red-600' : 'text-gray-900'
        )}>
          {isExpired ? 'Expired' : 'Active'}
        </span>
      </div>

      <div className={clsx(
        'text-4xl font-bold text-center py-6 rounded-lg',
        isExpired ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
      )}>
        {formatCountdown(remainingSeconds)}
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full transition-all duration-1000',
            isExpired ? 'bg-red-500' : 'bg-blue-500'
          )}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {isExpired && (
        <p className="text-sm text-center text-red-600">
          This game has ended. Results will be calculated soon.
        </p>
      )}
    </div>
  );
}
