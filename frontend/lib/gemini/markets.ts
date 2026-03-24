import { geminiGet } from './client';
import type {
  GeminiEvent,
  GeminiEventsResponse,
  GeminiCategoriesResponse,
  GeminiEventsFilter,
} from '@/types/gemini.types';

/**
 * List prediction market events with optional filters.
 */
export async function listEvents(filters?: GeminiEventsFilter): Promise<GeminiEventsResponse> {
  const params: Record<string, string | string[]> = {};

  if (filters?.status?.length) {
    params['status[]'] = filters.status;
  }
  if (filters?.category?.length) {
    params['category[]'] = filters.category;
  }
  if (filters?.search) {
    params.search = filters.search;
  }
  if (filters?.limit !== undefined) {
    params.limit = String(filters.limit);
  }
  if (filters?.offset !== undefined) {
    params.offset = String(filters.offset);
  }

  return geminiGet<GeminiEventsResponse>('/v1/prediction-markets/events', params);
}

/**
 * Get a single event by ticker.
 */
export async function getEvent(ticker: string): Promise<GeminiEvent> {
  return geminiGet<GeminiEvent>(`/v1/prediction-markets/events/${encodeURIComponent(ticker)}`);
}

/**
 * List newly listed events (created in last 24 hours).
 */
export async function listNewlyListedEvents(filters?: {
  category?: string[];
  limit?: number;
  offset?: number;
}): Promise<GeminiEventsResponse> {
  const params: Record<string, string | string[]> = {};
  if (filters?.category?.length) {
    params['category[]'] = filters.category;
  }
  if (filters?.limit !== undefined) {
    params.limit = String(filters.limit);
  }
  if (filters?.offset !== undefined) {
    params.offset = String(filters.offset);
  }

  return geminiGet<GeminiEventsResponse>('/v1/prediction-markets/events/newly-listed', params);
}

/**
 * List recently settled events (settled in last 24 hours).
 */
export async function listRecentlySettledEvents(filters?: {
  category?: string[];
  limit?: number;
  offset?: number;
}): Promise<GeminiEventsResponse> {
  const params: Record<string, string | string[]> = {};
  if (filters?.category?.length) {
    params['category[]'] = filters.category;
  }
  if (filters?.limit !== undefined) {
    params.limit = String(filters.limit);
  }
  if (filters?.offset !== undefined) {
    params.offset = String(filters.offset);
  }

  return geminiGet<GeminiEventsResponse>('/v1/prediction-markets/events/recently-settled', params);
}

/**
 * List available event categories.
 */
export async function listCategories(statusFilter?: string[]): Promise<GeminiCategoriesResponse> {
  const params: Record<string, string | string[]> = {};
  if (statusFilter?.length) {
    params['status[]'] = statusFilter;
  }

  return geminiGet<GeminiCategoriesResponse>('/v1/prediction-markets/categories', params);
}
