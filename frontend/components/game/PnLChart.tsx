'use client';

import { useMemo, memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { ScoreboardEntry } from '@/data/mock-scores';
import clsx from 'clsx';

interface PnLChartProps {
  participants: ScoreboardEntry[];
  currentUserId?: string;
  className?: string;
}

// Generate mock time-series data for visualization
// In production, this would come from historical position data
const generateHistoricalData = (participants: ScoreboardEntry[]) => {
  const timePoints = ['0h', '4h', '8h', '12h', '16h', '20h', '24h'];

  return timePoints.map((time, index) => {
    const dataPoint: any = { time };

    participants.forEach((p) => {
      const cost = p.totalCost ?? 0;
      const currentPnlPercent = cost > 0 ? ((p.pnl ?? 0) / cost) * 100 : 0;

      // Generate a progression from 0 to current P&L
      // Add some variation to make it more realistic
      let pnl: number;
      if (index === 0) {
        pnl = 0; // Start at 0%
      } else if (index === timePoints.length - 1) {
        pnl = currentPnlPercent; // End at current P&L
      } else {
        // Interpolate with some random variation
        const progress = index / (timePoints.length - 1);
        const variation = (Math.random() - 0.5) * 2; // -1 to +1
        pnl = currentPnlPercent * progress + variation;
      }

      dataPoint[p.userId] = Number(pnl.toFixed(1));
    });

    return dataPoint;
  });
};

// Custom tooltip component extracted and memoized to prevent re-creation on every render
const CustomTooltip = memo(({ active, payload, label, withPicks, currentUserId }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-md">
        <p className="text-sm font-medium text-gray-900 mb-3">{label}</p>
        <div className="space-y-3">
          {payload
            .sort((a: any, b: any) => b.value - a.value)
            .map((entry: any, index: number) => {
              const participant = withPicks.find((p: ScoreboardEntry) => p.userId === entry.dataKey);
              const isPositive = entry.value >= 0;
              const isCurrentUser = entry.dataKey === currentUserId;

              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between gap-4 items-center">
                    <span className="text-xs font-medium text-gray-900">
                      {participant?.nickname || 'Unknown'}
                      {isCurrentUser && ' (You)'}
                    </span>
                    <span
                      className={clsx(
                        'text-xs font-bold',
                        isPositive ? 'text-green-600' : 'text-red-500'
                      )}
                    >
                      {isPositive ? '+' : ''}{entry.value.toFixed(1)}%
                    </span>
                  </div>
                  {participant?.positions && participant.positions.length > 0 && (
                    <div className="ml-2 space-y-0.5 border-l-2 border-gray-100 pl-2">
                      {participant.positions.map((pos: any, posIdx: number) => {
                        const posIsPositive = pos.pnlPercent >= 0;
                        return (
                          <div key={posIdx} className="flex justify-between gap-3 text-xs">
                            <span className="text-gray-600 truncate" title={pos.contractLabel}>
                              {pos.contractLabel}
                            </span>
                            <div className="flex gap-2 items-center whitespace-nowrap">
                              <span className="text-gray-400">
                                {(pos.entryPrice * 100).toFixed(0)}¢ → {(pos.currentPrice * 100).toFixed(0)}¢
                              </span>
                              <span
                                className={clsx(
                                  'font-medium',
                                  posIsPositive ? 'text-green-600' : 'text-red-500'
                                )}
                              >
                                {posIsPositive ? '+' : ''}{pos.pnlPercent.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

export const PnLChart = ({ participants, currentUserId, className }: PnLChartProps) => {
  // Memoize filtered and sorted participants
  const withPicks = useMemo(() => {
    return participants
      .filter((p) => (p.numPicks ?? 0) > 0)
      .sort((a, b) => (b.pnl ?? 0) - (a.pnl ?? 0));
  }, [participants]);

  // Memoize chart data generation
  const chartData = useMemo(() => {
    return generateHistoricalData(withPicks);
  }, [withPicks]);

  if (withPicks.length === 0) {
    return (
      <div className={clsx('w-full bg-white rounded-2xl shadow-sm p-6', className)}>
        <h3 className="text-xl font-medium text-black mb-4">Unrealized P&L</h3>
        <p className="text-sm font-light text-gray-500 text-center py-8">
          No predictions made yet
        </p>
      </div>
    );
  }

  return (
    <div className={clsx('w-full bg-white rounded-2xl shadow-sm p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-black">Unrealized P&L</h3>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="time"
            stroke="#9CA3AF"
            style={{ fontSize: '11px', fontWeight: 300 }}
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '11px', fontWeight: 300 }}
            tick={{ fill: '#9CA3AF' }}
            tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`}
            domain={[-20, 20]}
            ticks={[-20, -15, -10, -5, 0, 5, 10, 15, 20]}
          />
          <Tooltip content={<CustomTooltip withPicks={withPicks} currentUserId={currentUserId} />} />
          <ReferenceLine y={0} stroke="#D1D5DB" strokeWidth={1} />
          <Legend
            wrapperStyle={{ fontSize: '12px', fontWeight: 400 }}
            formatter={(value) => {
              const participant = withPicks.find((p) => p.userId === value);
              const isCurrentUser = value === currentUserId;
              return `${participant?.nickname || value}${isCurrentUser ? ' (You)' : ''}`;
            }}
          />
          {withPicks.map((participant) => {
            const isCurrentUser = participant.userId === currentUserId;
            return (
              <Line
                key={participant.userId}
                type="monotone"
                dataKey={participant.userId}
                stroke={participant.color || '#9CA3AF'}
                strokeWidth={isCurrentUser ? 3 : 2}
                dot={{ r: isCurrentUser ? 5 : 3 }}
                activeDot={{ r: 6 }}
                opacity={isCurrentUser ? 1 : 0.7}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
