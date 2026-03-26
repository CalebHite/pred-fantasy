'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { CategoryPickSection } from './CategoryPickSection';
import { fetchCategoryEvents, ApiGeminiEvent, ApiGameCategory } from '@/lib/api/client';
import { useUI } from '@/contexts/UIContext';

interface CategoryPrediction {
  categoryKey: string;
  eventTicker: string;
  contractTicker: string;
  outcome: 'yes' | 'no';
}

interface CategoryPickWizardProps {
  gameCategories: ApiGameCategory[];
  onComplete: (predictions: CategoryPrediction[]) => void;
}

export const CategoryPickWizard = ({ gameCategories, onComplete }: CategoryPickWizardProps) => {
  const { showNotification } = useUI();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    gameCategories.length > 0 ? gameCategories[0].categoryKey : null
  );
  const [predictions, setPredictions] = useState<Map<string, CategoryPrediction>>(new Map());
  const [categoryMarkets, setCategoryMarkets] = useState<Map<string, ApiGeminiEvent[]>>(new Map());
  const [loadingMarkets, setLoadingMarkets] = useState<Set<string>>(new Set());

  // Load markets for first category on mount
  useEffect(() => {
    if (gameCategories.length > 0 && !categoryMarkets.has(gameCategories[0].categoryKey)) {
      loadMarketsForCategory(gameCategories[0].categoryKey);
    }
  }, []);

  const loadMarketsForCategory = async (categoryKey: string) => {
    if (categoryMarkets.has(categoryKey)) return;

    setLoadingMarkets(prev => new Set(prev).add(categoryKey));
    try {
      const result = await fetchCategoryEvents(categoryKey);
      setCategoryMarkets(prev => new Map(prev).set(categoryKey, result.events || []));
    } catch (err) {
      showNotification({ message: 'Failed to load markets', type: 'error' });
      console.error('Failed to load markets:', err);
    } finally {
      setLoadingMarkets(prev => {
        const next = new Set(prev);
        next.delete(categoryKey);
        return next;
      });
    }
  };

  // Fetch markets for a category when expanded
  const handleCategoryExpand = async (categoryKey: string) => {
    setExpandedCategory(categoryKey);
    await loadMarketsForCategory(categoryKey);
  };

  const handleMarketSelect = (categoryKey: string, eventTicker: string) => {
    setPredictions(prev => {
      const next = new Map(prev);
      const existing = next.get(categoryKey);
      next.set(categoryKey, {
        categoryKey,
        eventTicker,
        contractTicker: existing?.contractTicker || '',
        outcome: existing?.outcome || 'yes',
      });
      return next;
    });
  };

  const handleContractSelect = (categoryKey: string, contractTicker: string, outcome: 'yes' | 'no') => {
    setPredictions(prev => {
      const next = new Map(prev);
      const existing = next.get(categoryKey);
      if (!existing?.eventTicker) return prev; // Can't select contract without market

      next.set(categoryKey, { ...existing, contractTicker, outcome });
      return next;
    });
  };

  const isComplete = predictions.size === gameCategories.length &&
    Array.from(predictions.values()).every(p => p.eventTicker && p.contractTicker);

  const selectedCategory = gameCategories.find(c => c.categoryKey === expandedCategory);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-medium text-gray-900 mb-2">Make Your Predictions</h1>
        <p className="text-base font-light text-gray-600 mb-8">
          Select one contract per category
        </p>

        {/* Category Tabs */}
        <div className="flex items-center gap-6 mb-6 flex-wrap border-b border-gray-200">
          {gameCategories.map(category => {
            const isComplete = predictions.has(category.categoryKey) &&
              predictions.get(category.categoryKey)?.eventTicker &&
              predictions.get(category.categoryKey)?.contractTicker;

            const getBorderColor = () => {
              if (expandedCategory === category.categoryKey) return '#00D9FF';
              if (!isComplete) return '#EF4444'; // red-500
              return 'transparent';
            };

            return (
              <button
                key={category.categoryKey}
                onClick={() => handleCategoryExpand(category.categoryKey)}
                className={clsx(
                  'pb-3 font-medium text-sm transition-all flex items-center gap-2 border-b-2',
                  expandedCategory === category.categoryKey
                    ? 'text-gray-900'
                    : !isComplete
                      ? 'text-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                )}
                style={{ borderColor: getBorderColor() }}
              >
                {category.categoryName}
                {isComplete && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Category Content */}
        {selectedCategory && (
          <CategoryPickSection
            category={selectedCategory}
            isExpanded={true}
            isLoading={loadingMarkets.has(selectedCategory.categoryKey)}
            markets={categoryMarkets.get(selectedCategory.categoryKey) || []}
            prediction={predictions.get(selectedCategory.categoryKey)}
            onExpand={() => {}}
            onMarketSelect={(ticker) => handleMarketSelect(selectedCategory.categoryKey, ticker)}
            onContractSelect={(ticker, outcome) => handleContractSelect(selectedCategory.categoryKey, ticker, outcome)}
          />
        )}

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={() => onComplete(Array.from(predictions.values()))}
            disabled={!isComplete}
            variant="black"
            size="lg"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};
