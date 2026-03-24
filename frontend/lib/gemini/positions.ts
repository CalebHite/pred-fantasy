import { geminiPost } from './client';
import type { GeminiOrder, GeminiPosition, GeminiVolumeMetrics } from '@/types/gemini.types';

interface PaginatedOrders {
  orders: GeminiOrder[];
  pagination: { limit: number; offset: number; count: number };
}

/**
 * Get currently active (open) orders.
 */
export async function getActiveOrders(filters?: {
  symbol?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedOrders> {
  return geminiPost<PaginatedOrders>('/v1/prediction-markets/orders/active', {
    ...(filters?.symbol ? { symbol: filters.symbol } : {}),
    ...(filters?.limit !== undefined ? { limit: filters.limit } : {}),
    ...(filters?.offset !== undefined ? { offset: filters.offset } : {}),
  });
}

/**
 * Get historical orders (filled or cancelled).
 */
export async function getOrderHistory(filters?: {
  status?: 'filled' | 'cancelled';
  symbol?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedOrders> {
  return geminiPost<PaginatedOrders>('/v1/prediction-markets/orders/history', {
    ...(filters?.status ? { status: filters.status } : {}),
    ...(filters?.symbol ? { symbol: filters.symbol } : {}),
    ...(filters?.limit !== undefined ? { limit: filters.limit } : {}),
    ...(filters?.offset !== undefined ? { offset: filters.offset } : {}),
  });
}

/**
 * Get current filled positions.
 */
export async function getPositions(): Promise<GeminiPosition[]> {
  return geminiPost<GeminiPosition[]>('/v1/prediction-markets/positions');
}

/**
 * Get volume metrics for an event.
 */
export async function getVolumeMetrics(
  eventTicker: string,
  timeRange?: { startTime?: number; endTime?: number }
): Promise<GeminiVolumeMetrics> {
  return geminiPost<GeminiVolumeMetrics>('/v1/prediction-markets/metrics/volume', {
    eventTicker,
    ...(timeRange?.startTime !== undefined ? { startTime: timeRange.startTime } : {}),
    ...(timeRange?.endTime !== undefined ? { endTime: timeRange.endTime } : {}),
  });
}
