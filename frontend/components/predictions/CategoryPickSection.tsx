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
  predictions: CategoryPrediction[];
  onExpand: () => void;
  onMarketSelect: (ticker: string) => void;
  onContractSelect: (eventTicker: string, ticker: string, outcome: 'yes' | 'no') => void;
}

export const CategoryPickSection = ({
  category,
  isExpanded,
  isLoading,
  markets,
  predictions,
  onExpand,
  onMarketSelect,
  onContractSelect,
}: CategoryPickSectionProps) => {
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);

  // Helper function to check if a strike is selected
  const isStrikeSelected = (
    eventTicker: string,
    contractTicker: string,
    outcome: 'yes' | 'no'
  ) => predictions.some(p =>
    p.eventTicker === eventTicker &&
    p.contractTicker === contractTicker &&
    p.outcome === outcome
  );

  // Check if a market has any selections
  const hasSelectionInMarket = (marketTicker: string) =>
    predictions.some(p => p.eventTicker === marketTicker);

  // Auto-expand first market with selections
  useEffect(() => {
    if (predictions.length > 0 && !expandedMarket) {
      setExpandedMarket(predictions[0].eventTicker);
    }
  }, [predictions.length]);

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
                    const hasSelection = hasSelectionInMarket(market.ticker);
                    const isExpanded = expandedMarket === market.ticker;
                    const showContracts = isExpanded && market.contracts.length > 0;
                    const selectionCount = predictions.filter(p => p.eventTicker === market.ticker).length;

                    return (
                      <div key={market.ticker}>
                        <button
                          onClick={() => {
                            setExpandedMarket(isExpanded ? null : market.ticker);
                          }}
                          className={clsx(
                            'w-full p-4 rounded-xl border-2 text-left transition-all',
                            'hover:border-gray-300 hover:shadow-sm',
                            'flex items-center justify-between',
                            hasSelection
                              ? 'border-black bg-gray-50'
                              : 'border-gray-200 bg-white'
                          )}
                        >
                          <p className="text-sm font-medium text-gray-900">{market.title}</p>
                          <div className="flex items-center gap-2">
                            {hasSelection && (
                              <span className="w-6 h-6 flex items-center justify-center bg-black text-white text-xs rounded-full" style={{ fontWeight: 700 }}>
                                {selectionCount}
                              </span>
                            )}
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
                          </div>
                        </button>

                        {/* Contract Selection - Inline below market */}
                        {showContracts && (
                          <div className="ml-6 mt-2 mb-2">
                            <div className="space-y-2">
                              {isSportsCategory ? (
                                market.contracts.map(contract => {
                                  const isSelected = isStrikeSelected(market.ticker, contract.ticker, 'yes');

                                  return (
                                    <button
                                      key={contract.ticker}
                                      onClick={() => onContractSelect(market.ticker, contract.ticker, 'yes')}
                                      className={clsx(
                                        'w-full p-3 rounded-xl border-2 transition-all',
                                        'hover:border-gray-300 hover:shadow-sm',
                                        'flex items-center justify-between',
                                        isSelected
                                          ? 'border-black bg-gray-50'
                                          : 'border-gray-200 bg-white'
                                      )}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={clsx(
                                          'w-5 h-5 rounded border-2 flex items-center justify-center',
                                          isSelected ? 'bg-black border-black' : 'border-gray-300'
                                        )}>
                                          {isSelected && (
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                          )}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                          {contract.label}
                                        </span>
                                      </div>
                                      <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                                        {Math.round((contract.prices?.bestAsk || 0.5) * 100)}¢
                                      </span>
                                    </button>
                                  );
                                })
                              ) : (
                                market.contracts.map(contract => {
                                  const isYesSelected = isStrikeSelected(market.ticker, contract.ticker, 'yes');
                                  const isNoSelected = isStrikeSelected(market.ticker, contract.ticker, 'no');

                                  return (
                                    <div key={contract.ticker} className="space-y-2">
                                      <button
                                        onClick={() => onContractSelect(market.ticker, contract.ticker, 'yes')}
                                        className={clsx(
                                          'w-full p-3 rounded-xl border-2 transition-all',
                                          'hover:border-gray-300 hover:shadow-sm',
                                          'flex items-center justify-between',
                                          isYesSelected
                                            ? 'border-black bg-gray-50'
                                            : 'border-gray-200 bg-white'
                                        )}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className={clsx(
                                            'w-5 h-5 rounded border-2 flex items-center justify-center',
                                            isYesSelected ? 'bg-black border-black' : 'border-gray-300'
                                          )}>
                                            {isYesSelected && (
                                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                              </svg>
                                            )}
                                          </div>
                                          <span className="text-sm font-medium text-gray-900">
                                            {contract.label} - YES
                                          </span>
                                        </div>
                                        <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                                          {Math.round((contract.prices?.bestAsk || 0.5) * 100)}¢
                                        </span>
                                      </button>

                                      <button
                                        onClick={() => onContractSelect(market.ticker, contract.ticker, 'no')}
                                        className={clsx(
                                          'w-full p-3 rounded-xl border-2 transition-all',
                                          'hover:border-gray-300 hover:shadow-sm',
                                          'flex items-center justify-between',
                                          isNoSelected
                                            ? 'border-black bg-gray-50'
                                            : 'border-gray-200 bg-white'
                                        )}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className={clsx(
                                            'w-5 h-5 rounded border-2 flex items-center justify-center',
                                            isNoSelected ? 'bg-black border-black' : 'border-gray-300'
                                          )}>
                                            {isNoSelected && (
                                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                              </svg>
                                            )}
                                          </div>
                                          <span className="text-sm font-medium text-gray-900">
                                            {contract.label} - NO
                                          </span>
                                        </div>
                                        <span className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                                          {Math.round((1 - (contract.prices?.bestAsk || 0.5)) * 100)}¢
                                        </span>
                                      </button>
                                    </div>
                                  );
                                })
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
