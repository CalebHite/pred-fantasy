'use client';

import { useState, useEffect } from 'react';
import { PredictionCard } from './PredictionCard';
import { MarketStrikes } from '@/data/mock-strikes';
import { Button } from '@/components/ui/Button';
import clsx from 'clsx';

interface PredictionWizardProps {
  markets: MarketStrikes[];
  onComplete: (predictions: Record<string, string>) => void;
  className?: string;
}

export const PredictionWizard = ({
  markets,
  onComplete,
  className,
}: PredictionWizardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentMarket = markets[currentIndex];
  const isLastMarket = currentIndex === markets.length - 1;
  const isFirstMarket = currentIndex === 0;
  const progress = ((currentIndex + 1) / markets.length) * 100;

  const handleSelect = (strikeId: string) => {
    // Update predictions
    const newPredictions = {
      ...predictions,
      [currentMarket.categoryId]: strikeId,
    };
    setPredictions(newPredictions);

    // Auto-advance to next card after selection with a brief delay
    if (!isLastMarket) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsTransitioning(false);
      }, 400); // 400ms delay for user to see selection before advancing
    }
  };

  const handleBack = () => {
    if (!isFirstMarket) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleSubmit = () => {
    onComplete(predictions);
  };

  const allPredictionsMade = Object.keys(predictions).length === markets.length;

  return (
    <div className={clsx('w-full min-h-screen bg-gray-50 py-12 px-4', className)}>
      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">
            Prediction {currentIndex + 1} of {markets.length}
          </span>
          <span className="text-sm font-light text-gray-600">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-black transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Prediction Card with Transition */}
      <div
        className={clsx(
          'transition-all duration-300',
          isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        )}
      >
        <PredictionCard
          market={currentMarket}
          selectedStrike={predictions[currentMarket.categoryId]}
          onSelect={handleSelect}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="max-w-2xl mx-auto mt-8 flex items-center justify-between">
        <Button
          onClick={handleBack}
          variant="outline-black"
          disabled={isFirstMarket || isTransitioning}
          className={clsx(
            isFirstMarket && 'invisible'
          )}
        >
          ← Back
        </Button>

        {isLastMarket && allPredictionsMade && (
          <Button
            onClick={handleSubmit}
            variant="black"
            size="lg"
            disabled={isTransitioning}
          >
            Submit Predictions
          </Button>
        )}
      </div>

      {/* Helper Text */}
      {!predictions[currentMarket.categoryId] && (
        <p className="max-w-2xl mx-auto mt-6 text-center text-sm text-gray-500">
          Select your prediction to continue
        </p>
      )}
    </div>
  );
};
