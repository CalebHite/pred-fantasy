'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { ScoreboardEntry } from '@/data/mock-scores';
import clsx from 'clsx';

interface PnLChartProps {
  participants: ScoreboardEntry[];
  currentUserId?: string;
  className?: string;
}

export const PnLChart = ({ participants, currentUserId, className }: PnLChartProps) => {
  // Only show participants who have picks
  const withPicks = participants
    .filter((p) => (p.numPicks ?? 0) > 0)
    .sort((a, b) => (b.pnl ?? 0) - (a.pnl ?? 0));

  if (withPicks.length === 0) {
    return (
      <div className={clsx('w-full bg-white rounded-2xl shadow-sm p-6', className)}>
        <h3 className="text-xl font-medium text-black mb-4">Expected P&L</h3>
        <p className="text-sm font-light text-gray-500 text-center py-8">
          No predictions made yet
        </p>
      </div>
    );
  }

  const chartData = withPicks.map((p) => ({
    name: p.nickname,
    pnl: Number(((p.pnl ?? 0) * 100).toFixed(1)), // cents
    cost: Number(((p.totalCost ?? 0) * 100).toFixed(1)),
    value: Number(((p.totalValue ?? 0) * 100).toFixed(1)),
    color: p.color || '#9CA3AF',
    isCurrentUser: p.userId === currentUserId,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      const pnlValue = data.pnl;
      const isPositive = pnlValue >= 0;

      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {label}{data.isCurrentUser ? ' (You)' : ''}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-xs font-light text-gray-500">Cost basis</span>
              <span className="text-xs font-medium text-gray-700">{data.cost.toFixed(1)}¢</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs font-light text-gray-500">Current value</span>
              <span className="text-xs font-medium text-gray-700">{data.value.toFixed(1)}¢</span>
            </div>
            <div className="border-t border-gray-100 pt-1 mt-1">
              <div className="flex justify-between gap-4">
                <span className="text-xs font-medium text-gray-700">P&L</span>
                <span className={clsx(
                  'text-xs font-medium',
                  isPositive ? 'text-green-600' : 'text-red-500'
                )}>
                  {isPositive ? '+' : ''}{pnlValue.toFixed(1)}¢
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={clsx('w-full bg-white rounded-2xl shadow-sm p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-black">Expected P&L</h3>
        <span className="text-xs font-light text-gray-400">
          Per contract, equal weight
        </span>
      </div>

      <ResponsiveContainer width="100%" height={Math.max(200, withPicks.length * 60)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
          <XAxis
            type="number"
            stroke="#9CA3AF"
            style={{ fontSize: '11px', fontWeight: 300 }}
            tick={{ fill: '#9CA3AF' }}
            tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}¢`}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#9CA3AF"
            style={{ fontSize: '12px', fontWeight: 400 }}
            tick={{ fill: '#374151' }}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
          <ReferenceLine x={0} stroke="#D1D5DB" strokeWidth={1} />
          <Bar dataKey="pnl" radius={[0, 4, 4, 0]} barSize={28}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'}
                opacity={entry.isCurrentUser ? 1 : 0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
