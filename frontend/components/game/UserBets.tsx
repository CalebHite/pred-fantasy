'use client';

import { getCategoryIcon } from '@/lib/categoryIcons';
import Image from 'next/image';
import clsx from 'clsx';

export interface UserBet {
  id: string;
  categoryId: string;
  categoryKey?: string; // For icon lookup
  categoryName: string;
  selectedOption: string; // The prediction/strike the user selected
  currentOdds?: string; // Current odds
  initialOdds?: string; // Odds when bet was placed
  status: 'pending' | 'winning' | 'losing' | 'completed';
}

interface UserBetsProps {
  bets: UserBet[];
  className?: string;
}

export const UserBets = ({ bets, className }: UserBetsProps) => {
  if (bets.length === 0) {
    return (
      <div className={clsx('w-full bg-white rounded-2xl shadow-sm p-6', className)}>
        <h3 className="text-xl font-medium text-black mb-4">Your Bets</h3>
        <div className="flex flex-col items-center justify-center py-8">
          <Image
            src="/icons/swords.svg"
            alt="No bets"
            width={48}
            height={48}
            className="w-12 h-12 opacity-30 mb-3"
          />
          <p className="text-sm font-light text-gray-500 text-center">
            No predictions made yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('w-full bg-white rounded-2xl shadow-sm p-6', className)}>
      <h3 className="text-xl font-medium text-black mb-4">Your Bets</h3>

      <div className="space-y-3">
        {bets.map((bet) => {
          const getStatusColor = () => {
            switch (bet.status) {
              case 'winning':
                return 'text-green-600 bg-green-50';
              case 'losing':
                return 'text-red-600 bg-red-50';
              case 'completed':
                return 'text-blue-600 bg-blue-50';
              default:
                return 'text-gray-600 bg-gray-50';
            }
          };

          const getStatusText = () => {
            switch (bet.status) {
              case 'winning':
                return 'Winning';
              case 'losing':
                return 'Losing';
              case 'completed':
                return 'Completed';
              default:
                return 'Pending';
            }
          };

          const iconSrc = bet.categoryKey ? getCategoryIcon(bet.categoryKey) : '/icons/swords.svg';

          return (
            <div
              key={bet.id}
              className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                {/* Category Icon */}
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <Image
                    src={iconSrc}
                    alt={bet.categoryName}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>

                {/* Bet Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {bet.categoryName}
                      </p>
                      <p className="text-xs font-light text-gray-600 mt-1">
                        {bet.selectedOption}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={clsx(
                        'text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap',
                        getStatusColor()
                      )}
                    >
                      {getStatusText()}
                    </span>
                  </div>

                  {/* Odds Display */}
                  {(bet.initialOdds || bet.currentOdds) && (
                    <div className="flex items-center gap-2 mt-2">
                      {bet.initialOdds && (
                        <span className="text-xs font-light text-gray-500">
                          {bet.initialOdds}
                        </span>
                      )}
                      {bet.initialOdds && bet.currentOdds && (
                        <Image
                          src="/icons/arrows.svg"
                          alt="odds change"
                          width={12}
                          height={12}
                          className="w-3 h-3 opacity-40"
                        />
                      )}
                      {bet.currentOdds && (
                        <span
                          className={clsx(
                            'text-xs font-medium',
                            bet.status === 'winning'
                              ? 'text-green-600'
                              : bet.status === 'losing'
                              ? 'text-red-600'
                              : 'text-gray-700'
                          )}
                        >
                          {bet.currentOdds}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
