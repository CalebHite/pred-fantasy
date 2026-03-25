'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { fetchEvent, ApiGeminiEvent, ApiGeminiContract } from '@/lib/api/client';
import clsx from 'clsx';

interface PredictionSelectorProps {
  /** Event tickers from the game's events list */
  eventTickers: string[];
  onSubmit?: (predictions: { eventTicker: string; contractTicker: string; outcome: string }[]) => void;
}

interface EventWithContracts {
  ticker: string;
  title: string;
  contracts: ApiGeminiContract[];
}

export function PredictionSelector({ eventTickers, onSubmit }: PredictionSelectorProps) {
  // Map of eventTicker -> selected contractTicker
  const [selections, setSelections] = useState<Record<string, { contractTicker: string; outcome: string }>>({});
  const [events, setEvents] = useState<EventWithContracts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all(
      eventTickers.map((ticker) =>
        fetchEvent(ticker)
          .then((ev) => ({
            ticker: ev.ticker,
            title: ev.title,
            contracts: ev.contracts,
          }))
          .catch(() => ({
            ticker,
            title: ticker,
            contracts: [] as ApiGeminiContract[],
          }))
      )
    ).then((results) => {
      if (!cancelled) {
        setEvents(results);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [eventTickers]);

  const handleSelect = (eventTicker: string, contractTicker: string) => {
    setSelections((prev) => ({
      ...prev,
      [eventTicker]: { contractTicker, outcome: 'yes' },
    }));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      const picks = Object.entries(selections).map(([eventTicker, sel]) => ({
        eventTicker,
        contractTicker: sel.contractTicker,
        outcome: sel.outcome,
      }));
      onSubmit(picks);
    }
  };

  const allPredictionsMade = eventTickers.every((t) => selections[t]);
  const completionPercentage = Math.round((Object.keys(selections).length / eventTickers.length) * 100);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <Card padding="md" className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Predictions Made</span>
          <span className="text-sm font-bold text-blue-600">
            {Object.keys(selections).length} / {eventTickers.length}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </Card>

      {/* Markets and Contracts */}
      <div className="space-y-4">
        {events.map((event) => {
          const selected = selections[event.ticker];

          return (
            <Card key={event.ticker} padding="lg">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500">{event.ticker}</p>
                </div>
                {selected && (
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
                )}
              </div>

              {event.contracts.length === 0 ? (
                <p className="text-sm text-gray-400">No contracts available for this event.</p>
              ) : (
                <div className="grid gap-2">
                  {event.contracts.map((contract) => {
                    const isSelected = selected?.contractTicker === contract.ticker;
                    const price = contract.prices?.lastTradePrice ?? contract.prices?.bestAsk;

                    return (
                      <button
                        key={contract.ticker}
                        onClick={() => handleSelect(event.ticker, contract.ticker)}
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
                              isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
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
                          <span className={clsx('font-medium', isSelected ? 'text-blue-900' : 'text-gray-900')}>
                            {contract.label}
                          </span>
                        </div>
                        {price != null && (
                          <span
                            className={clsx(
                              'text-sm font-semibold px-2 py-1 rounded',
                              isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            ${typeof price === 'number' ? price.toFixed(2) : price}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Submit button */}
      <Card padding="lg" className="sticky bottom-4 bg-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-900">Ready to submit your predictions?</div>
            <div className="text-sm text-gray-600">
              {allPredictionsMade
                ? 'All predictions made'
                : `${eventTickers.length - Object.keys(selections).length} predictions remaining`}
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={!allPredictionsMade} size="lg">
            Submit Predictions
          </Button>
        </div>
      </Card>
    </div>
  );
}
