'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Spinner } from '@/components/ui/Spinner';
import { ApiGeminiEvent, ApiGameCategory } from '@/lib/api/client';

interface CategoryPrediction {
  categoryKey: string;
  eventTicker: string;
  contractTicker: string;
  outcome: 'yes' | 'no';
}

interface CategoryPickSectionProps {
  category: ApiGameCategory;
  isExpanded: boolean;
  isLoading: boolean;
  markets: ApiGeminiEvent[];
  prediction?: CategoryPrediction;
  onExpand: () => void;
  onMarketSelect: (ticker: string) => void;
  onContractSelect: (ticker: string, outcome: 'yes' | 'no') => void;
}

export const CategoryPickSection = ({
  category,
  isExpanded,
  isLoading,
  markets,
  prediction,
  onExpand,
  onMarketSelect,
  onContractSelect,
}: CategoryPickSectionProps) => {
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);
  const selectedMarket = markets.find(m => m.ticker === prediction?.eventTicker);
  const isComplete = prediction?.eventTicker && prediction?.contractTicker;

  // Auto-expand when market is selected
  useEffect(() => {
    if (prediction?.eventTicker && !expandedMarket) {
      setExpandedMarket(prediction.eventTicker);
    }
  }, [prediction?.eventTicker]);

  // Detect sports categories - only show YES strikes for simplified team selection
  const isSportsCategory = category.categoryName.includes('NBA') ||
                          category.categoryName.includes('NFL') ||
                          category.categoryName.includes('MLB') ||
                          category.categoryName.includes('NCAA') ||
                          category.categoryName.includes('EPL') ||
                          category.categoryName.includes('Tennis') ||
                          category.categoryName.includes('Hockey') ||
                          category.categoryName.includes('Soccer');

  return (
    <div>
      {isExpanded && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : markets.length === 0 ? (
            <p className="text-center py-8 text-gray-500 text-sm">
              No active markets found in this category
            </p>
          ) : (
            <>
              {/* Market Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Select Market
                </label>
                <div className="space-y-2">
                  {markets.map(market => {
                    const isSelected = prediction?.eventTicker === market.ticker;
                    const isExpanded = expandedMarket === market.ticker;
                    const showContracts = isExpanded && isSelected && selectedMarket && selectedMarket.contracts.length > 0;

                    return (
                      <div key={market.ticker}>
                        <button
                          onClick={() => {
                            onMarketSelect(market.ticker);
                            setExpandedMarket(isExpanded ? null : market.ticker);
                          }}
                          className={clsx(
                            'w-full p-4 rounded-xl border-2 text-left transition-all',
                            'hover:border-gray-300 hover:shadow-sm',
                            'flex items-center justify-between',
                            isSelected
                              ? 'border-black bg-gray-50'
                              : 'border-gray-200 bg-white'
                          )}
                        >
                          <p className="text-sm font-medium text-gray-900">{market.title}</p>
                          {isSelected && (
                            <svg
                              className={clsx(
                                'w-5 h-5 text-gray-600 transition-transform',
                                isExpanded && 'rotate-180'
                              )}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </button>

                        {/* Contract Selection - Inline below selected market */}
                        {showContracts && (
                          <div className="ml-6 mt-2 mb-2">
                            <div className="space-y-2">
                              {isSportsCategory ? (
                                selectedMarket.contracts.map(contract => (
                                  <button
                                    key={contract.ticker}
                                    onClick={() => onContractSelect(contract.ticker, 'yes')}
                                    className={clsx(
                                      'w-full p-3 rounded-xl border-2 transition-all',
                                      'hover:border-gray-300 hover:shadow-sm',
                                      'flex items-center justify-between',
                                      prediction?.contractTicker === contract.ticker
                                        ? 'border-black bg-gray-50'
                                        : 'border-gray-200 bg-white'
                                    )}
                                  >
                                    <span className="text-sm font-medium text-gray-900">
                                      {contract.label}
                                    </span>
                                    <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                                      {Math.round((contract.prices?.bestAsk || 0.5) * 100)}¢
                                    </span>
                                  </button>
                                ))
                              ) : (
                                selectedMarket.contracts.map(contract => (
                                  <div key={contract.ticker} className="space-y-2">
                                    <button
                                      onClick={() => onContractSelect(contract.ticker, 'yes')}
                                      className={clsx(
                                        'w-full p-3 rounded-xl border-2 transition-all',
                                        'hover:border-gray-300 hover:shadow-sm',
                                        'flex items-center justify-between',
                                        prediction?.contractTicker === contract.ticker && prediction?.outcome === 'yes'
                                          ? 'border-black bg-gray-50'
                                          : 'border-gray-200 bg-white'
                                      )}
                                    >
                                      <div>
                                        <span className="text-sm font-medium text-gray-900">
                                          {contract.label} - YES
                                        </span>
                                      </div>
                                      <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                                        {Math.round((contract.prices?.bestAsk || 0.5) * 100)}¢
                                      </span>
                                    </button>

                                    <button
                                      onClick={() => onContractSelect(contract.ticker, 'no')}
                                      className={clsx(
                                        'w-full p-3 rounded-xl border-2 transition-all',
                                        'hover:border-gray-300 hover:shadow-sm',
                                        'flex items-center justify-between',
                                        prediction?.contractTicker === contract.ticker && prediction?.outcome === 'no'
                                          ? 'border-black bg-gray-50'
                                          : 'border-gray-200 bg-white'
                                      )}
                                    >
                                      <div>
                                        <span className="text-sm font-medium text-gray-900">
                                          {contract.label} - NO
                                        </span>
                                      </div>
                                      <span className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                                        {Math.round((1 - (contract.prices?.bestAsk || 0.5)) * 100)}¢
                                      </span>
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
