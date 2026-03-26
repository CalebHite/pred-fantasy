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
  const [predictions, setPredictions] = useState<CategoryPrediction[]>([]);
  const [categoryMarkets, setCategoryMarkets] = useState<Map<string, ApiGeminiEvent[]>>(new Map());
  const [loadingMarkets, setLoadingMarkets] = useState<Set<string>>(new Set());
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

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
    // No longer needed for multi-select, but kept for compatibility
  };

  const handleContractSelect = (
    categoryKey: string,
    eventTicker: string,
    contractTicker: string,
    outcome: 'yes' | 'no'
  ) => {
    setPredictions(prev => {
      // Check if this exact pick already exists
      const existingIndex = prev.findIndex(p =>
        p.categoryKey === categoryKey &&
        p.eventTicker === eventTicker &&
        p.contractTicker === contractTicker &&
        p.outcome === outcome
      );

      if (existingIndex >= 0) {
        // Already selected - remove it (toggle off)
        return prev.filter((_, idx) => idx !== existingIndex);
      } else {
        // Not selected - add it (toggle on)
        return [...prev, { categoryKey, eventTicker, contractTicker, outcome }];
      }
    });
  };

  const isComplete = predictions.length >= 2;

  const handleSubmit = () => {
    setHasAttemptedSubmit(true);
    if (isComplete) {
      onComplete(predictions);
    } else {
      showNotification({
        message: 'Please select at least 2 strikes',
        type: 'error'
      });
    }
  };

  const selectedCategory = gameCategories.find(c => c.categoryKey === expandedCategory);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-medium text-gray-900 mb-2">Make Your Predictions</h1>
        <p className="text-base font-light text-gray-600 mb-8">
          Select at least 2 strikes across any categories
        </p>

        {/* Category Tabs */}
        <div className="flex items-center gap-6 mb-6 flex-wrap border-b border-gray-200">
          {gameCategories.map(category => {
            const categoryPredictions = predictions.filter(p => p.categoryKey === category.categoryKey);
            const count = categoryPredictions.length;

            const getBorderColor = () => {
              if (expandedCategory === category.categoryKey) return '#00D9FF';
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
                    : 'text-gray-500 hover:text-gray-700'
                )}
                style={{ borderColor: getBorderColor() }}
              >
                {category.categoryName}
                {count > 0 && (
                  <span className="ml-2 w-5 h-5 flex items-center justify-center bg-black text-white text-xs rounded-full" style={{ fontWeight: 700 }}>
                    {count}
                  </span>
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
            predictions={predictions.filter(p => p.categoryKey === selectedCategory.categoryKey)}
            onExpand={() => {}}
            onMarketSelect={(ticker) => handleMarketSelect(selectedCategory.categoryKey, ticker)}
            onContractSelect={(eventTicker, ticker, outcome) => handleContractSelect(selectedCategory.categoryKey, eventTicker, ticker, outcome)}
          />
        )}

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSubmit}
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
