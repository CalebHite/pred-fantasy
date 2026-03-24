'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCategoryById } from '@/data/mock-categories';
import { getStrikesForCategory } from '@/data/mock-strikes';
import clsx from 'clsx';

interface PredictionSelectorProps {
  categoryIds: string[];
  onSubmit?: (predictions: Record<string, string>) => void;
}

export function PredictionSelector({ categoryIds, onSubmit }: PredictionSelectorProps) {
  const [selectedPredictions, setSelectedPredictions] = useState<Record<string, string>>({});

  const handleSelectStrike = (categoryId: string, strikeId: string) => {
    setSelectedPredictions((prev) => ({
      ...prev,
      [categoryId]: strikeId,
    }));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(selectedPredictions);
    }
  };

  const allPredictionsMade = categoryIds.every((id) => selectedPredictions[id]);
  const completionPercentage = Math.round((Object.keys(selectedPredictions).length / categoryIds.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <Card padding="md" className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Predictions Made
          </span>
          <span className="text-sm font-bold text-blue-600">
            {Object.keys(selectedPredictions).length} / {categoryIds.length}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </Card>

      {/* Markets and Strikes */}
      <div className="space-y-4">
        {categoryIds.map((categoryId) => {
          const category = getCategoryById(categoryId);
          const marketStrikes = getStrikesForCategory(categoryId);
          const selectedStrike = selectedPredictions[categoryId];

          if (!category || !marketStrikes) return null;

          return (
            <Card key={categoryId} padding="lg">
              <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl">{category.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
                {selectedStrike && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Selected
                    </span>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                {marketStrikes.strikes.map((strike) => {
                  const isSelected = selectedStrike === strike.id;

                  return (
                    <button
                      key={strike.id}
                      onClick={() => handleSelectStrike(categoryId, strike.id)}
                      className={clsx(
                        'flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left',
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={clsx(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                            isSelected
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          )}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className={clsx(
                          'font-medium',
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        )}>
                          {strike.label}
                        </span>
                      </div>
                      {strike.odds && (
                        <span className={clsx(
                          'text-sm font-semibold px-2 py-1 rounded',
                          isSelected
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        )}>
                          {strike.odds}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Submit button */}
      <Card padding="lg" className="sticky bottom-4 bg-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-900">
              Ready to submit your predictions?
            </div>
            <div className="text-sm text-gray-600">
              {allPredictionsMade
                ? 'All predictions made'
                : `${categoryIds.length - Object.keys(selectedPredictions).length} predictions remaining`}
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!allPredictionsMade}
            size="lg"
          >
            Submit Predictions
          </Button>
        </div>
      </Card>
    </div>
  );
}
