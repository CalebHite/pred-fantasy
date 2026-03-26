/**
 * Frontend API client — thin wrappers around the backend API routes.
 */

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ── Games ──────────────────────────────────────────────

export interface ApiCategory {
  key: string;
  name: string;
  type: 'crypto' | 'sports' | 'politics' | 'entertainment';
  description: string;
  icon?: string;
  marketCount?: number;
}

export interface ApiGameCategory {
  id: number;
  gameId: string;
  categoryKey: string;
  categoryName: string;
  categoryType: string;
  matchingRules: string;
}

export interface ApiGame {
  id: string;
  code: string;
  hostAddress: string;
  buyInAmount: number;
  maxParticipants: number | null;
  resolutionTime: string;
  status: string;
  rules: string | null;
  createdAt: string;
  startedAt: string | null;
  resolvedAt: string | null;
  categories: ApiGameCategory[];
  events: ApiGameEvent[];
  participants: ApiParticipant[];
}

export interface ApiGameEvent {
  id: number;
  gameId: string;
  eventTicker: string;
  eventTitle: string;
  eventType: string;
}

export interface ApiParticipant {
  id: number;
  gameId: string;
  walletAddress: string;
  nickname: string;
  hasPaid: boolean;
  joinedAt: string;
}

export interface ApiPrediction {
  id: number;
  gameId: string;
  participantId: number;
  categoryKey: string | null;
  eventTicker: string;
  eventTitle: string | null;
  contractTicker: string;
  contractLabel: string | null;
  outcome: string;
  entryPrice: string | null; // contract price at time of pick (e.g. "0.67")
  isCorrect: boolean | null;
  createdAt: string;
}

export async function fetchGames(status?: string): Promise<ApiGame[]> {
  const query = status ? `?status=${status}` : '';
  const data = await request<{ games: ApiGame[] }>(`/games${query}`);
  return data.games;
}

export async function fetchGame(gameId: string): Promise<ApiGame> {
  return request<ApiGame>(`/games/${gameId}`);
}

export async function createGame(params: {
  hostAddress: string;
  buyInAmount: number;
  maxParticipants?: number;
  resolutionTime: string;
  rules?: string;
  categories?: { categoryKey: string; categoryName: string; categoryType: string }[];
  events?: { ticker: string; title: string; type: string }[];
}): Promise<ApiGame> {
  return request<ApiGame>('/games', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function joinGame(gameId: string, params: {
  walletAddress: string;
  nickname: string;
}): Promise<ApiGame> {
  return request<ApiGame>(`/games/${gameId}/join`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function fetchPredictions(gameId: string, walletAddress?: string): Promise<ApiPrediction[]> {
  const query = walletAddress ? `?walletAddress=${walletAddress}` : '';
  const data = await request<{ predictions: ApiPrediction[] }>(`/games/${gameId}/predictions${query}`);
  return data.predictions;
}

export async function submitPredictions(gameId: string, params: {
  walletAddress: string;
  picks: {
    categoryKey: string;
    eventTicker: string;
    contractTicker: string;
    outcome: string;
    entryPrice?: string;
  }[];
}): Promise<ApiPrediction[]> {
  const data = await request<{ predictions: ApiPrediction[] }>(`/games/${gameId}/predictions`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return data.predictions;
}

export async function startGame(gameId: string, hostAddress: string) {
  return request<{ orders: unknown[] }>(`/games/${gameId}/start`, {
    method: 'POST',
    body: JSON.stringify({ hostAddress }),
  });
}

export async function settleGame(gameId: string) {
  return request(`/games/${gameId}/settle`, { method: 'POST' });
}

// ── Gemini Events ──────────────────────────────────────

export interface ApiGeminiEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  type: string;
  category: string;
  ticker: string;
  status: string;
  contracts: ApiGeminiContract[];
}

export interface ApiGeminiContract {
  id: string;
  label: string;
  ticker: string;
  instrumentSymbol: string;
  status: string;
  prices: {
    buy: { yes: number; no: number };
    sell: { yes: number; no: number };
    bestBid: number;
    bestAsk: number;
    lastTradePrice: number;
  };
}

export async function fetchEvents(filters?: {
  status?: string[];
  category?: string[];
  search?: string;
  limit?: number;
}): Promise<{ data: ApiGeminiEvent[]; pagination: { total: number } }> {
  const params = new URLSearchParams();
  filters?.status?.forEach(s => params.append('status', s));
  filters?.category?.forEach(c => params.append('category', c));
  if (filters?.search) params.set('search', filters.search);
  if (filters?.limit) params.set('limit', String(filters.limit));
  const query = params.toString() ? `?${params}` : '';
  return request(`/events${query}`);
}

export async function fetchEvent(ticker: string): Promise<ApiGeminiEvent> {
  return request(`/events/${encodeURIComponent(ticker)}`);
}

export async function fetchGameCategories(): Promise<{ categories: ApiCategory[] }> {
  return request('/categories');
}

export async function fetchCategoryEvents(categoryKey: string): Promise<{ events: ApiGeminiEvent[] }> {
  return request(`/categories/${encodeURIComponent(categoryKey)}/events`);
}

// Legacy Gemini categories endpoint
export async function fetchCategories(): Promise<{ categories: string[] }> {
  return request('/categories');
}
