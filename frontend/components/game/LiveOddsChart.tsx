'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { OddsDataPoint, UserOddsInfo } from '@/data/mock-odds';
import { formatRelativeTime } from '@/lib/utils/format';
import clsx from 'clsx';

interface LiveOddsChartProps {
  data: OddsDataPoint[];
  users: UserOddsInfo[];
  className?: string;
}

export const LiveOddsChart = ({ data, users, className }: LiveOddsChartProps) => {
  // Format data for Recharts (convert timestamp to string for X-axis)
  const formattedData = data.map((point) => ({
    time: formatRelativeTime(point.timestamp),
    ...Object.keys(point).reduce((acc, key) => {
      if (key !== 'timestamp') {
        acc[key] = point[key];
      }
      return acc;
    }, {} as Record<string, number>),
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any) => {
            const user = users.find((u) => u.userId === entry.dataKey);
            return (
              <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-light text-gray-700">
                  {user?.nickname}:
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {entry.value.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
        {payload.map((entry: any) => {
          const user = users.find((u) => u.userId === entry.dataKey);
          return (
            <div key={entry.dataKey} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-light text-gray-700">
                {user?.nickname}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={clsx('w-full bg-white rounded-2xl shadow-sm p-6', className)}>
      <h3 className="text-xl font-medium text-black mb-6">Live Odds</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="time"
            stroke="#6B7280"
            style={{ fontSize: '12px', fontWeight: 300 }}
            tick={{ fill: '#6B7280' }}
          />
          <YAxis
            stroke="#6B7280"
            style={{ fontSize: '12px', fontWeight: 300 }}
            tick={{ fill: '#6B7280' }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          {users.map((user) => (
            <Line
              key={user.userId}
              type="monotone"
              dataKey={user.userId}
              stroke={user.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
