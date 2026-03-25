'use client';

import { MarketStrikes, Strike } from '@/data/mock-strikes';
import { getCategoryById } from '@/data/mock-categories';
import Image from 'next/image';
import clsx from 'clsx';

interface PredictionCardProps {
  market: MarketStrikes;
  selectedStrike?: string; // Strike ID that's currently selected
  onSelect: (strikeId: string) => void;
  className?: string;
}

export const PredictionCard = ({
  market,
  selectedStrike,
  onSelect,
  className,
}: PredictionCardProps) => {
  const category = getCategoryById(market.categoryId);
  const isEmoji = category?.icon && !category.icon.startsWith('/');

  return (
    <div
      className={clsx(
        'w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8',
        className
      )}
    >
      {/* Category Icon and Name */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          {category && (
            isEmoji ? (
              <span className="text-4xl">{category.icon}</span>
            ) : (
              <Image
                src={category.icon || '/icons/swords.svg'}
                alt={category.name}
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
            )
          )}
        </div>
        <h2 className="text-2xl font-medium text-black text-center">
          {market.categoryName}
        </h2>
      </div>

      {/* Prediction Options */}
      <div className="space-y-3">
        {market.strikes.map((strike) => (
          <button
            key={strike.id}
            onClick={() => onSelect(strike.id)}
            className={clsx(
              'w-full p-4 rounded-xl border-2 transition-all duration-200',
              'flex items-center justify-between',
              'hover:shadow-md',
              selectedStrike === strike.id
                ? 'border-black bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <span
              className={clsx(
                'text-lg font-light',
                selectedStrike === strike.id
                  ? 'text-black font-medium'
                  : 'text-gray-900'
              )}
            >
              {strike.label}
            </span>
            {strike.odds && (
              <span
                className={clsx(
                  'text-sm px-3 py-1 rounded-full',
                  selectedStrike === strike.id
                    ? 'bg-black text-white font-medium'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {strike.odds}
              </span>
            )}
            {selectedStrike === strike.id && (
              <div className="absolute right-6 w-6 h-6 rounded-full bg-black flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
