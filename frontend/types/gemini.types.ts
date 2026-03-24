/** Gemini Prediction Markets API types */

export interface GeminiEventContract {
  id: string;
  label: string;
  abbreviatedName: string;
  ticker: string;
  instrumentSymbol: string;
  status: string;
  color: string;
  marketState: 'open' | 'closed';
  totalShares: number;
  resolutionSide: 'yes' | 'no' | null;
  termsAndConditionsUrl: string;
  createdAt: string;
  expiryDate: string;
  prices: {
    buy: { yes: number; no: number };
    sell: { yes: number; no: number };
    bestBid: number;
    bestAsk: number;
    lastTradePrice: number;
  };
}

export interface GeminiEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  type: 'binary' | 'categorical';
  category: string;
  series: string | null;
  ticker: string;
  status: 'approved' | 'active' | 'closed' | 'under_review' | 'settled' | 'invalid';
  createdAt: string;
  effectiveDate: string;
  expiryDate: string;
  resolvedAt: string | null;
  liquidity: number;
  tags: string[];
  subcategory: {
    id: string;
    slug: string;
    name: string;
    path: string[];
  } | null;
  contracts: GeminiEventContract[];
}

export interface GeminiEventsResponse {
  data: GeminiEvent[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface GeminiCategoriesResponse {
  categories: string[];
}

export interface GeminiOrderRequest {
  symbol: string;
  orderType: 'limit';
  side: 'buy' | 'sell';
  quantity: string;
  price: string;
  outcome: 'yes' | 'no';
  timeInForce?: 'good-til-cancel' | 'immediate-or-cancel' | 'fill-or-kill';
}

export interface GeminiContractMetadata {
  eventTicker: string;
  eventTitle: string;
  contractTicker: string;
  contractLabel: string;
  expiryDate: string;
}

export interface GeminiOrder {
  orderId: string;
  status: string;
  symbol: string;
  side: 'buy' | 'sell';
  outcome: 'yes' | 'no';
  quantity: string;
  filledQuantity: string;
  remainingQuantity: string;
  price: string;
  avgExecutionPrice: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  contractMetadata: GeminiContractMetadata;
}

export interface GeminiPosition {
  symbol: string;
  instrumentId: number;
  totalQuantity: string;
  avgPrice: string;
  outcome: 'yes' | 'no';
  contractMetadata: GeminiContractMetadata;
}

export interface GeminiVolumeMetrics {
  eventTicker: string;
  contracts: {
    symbol: string;
    totalQty: string;
    userAggressorQty: string;
    userRestingQty: string;
  }[];
}

export interface GeminiEventsFilter {
  status?: string[];
  category?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}
