import { geminiPost } from './client';
import type { GeminiOrder, GeminiOrderRequest } from '../../types/gemini.types';

/**
 * Place a prediction market limit order.
 */
export async function placeOrder(params: GeminiOrderRequest): Promise<GeminiOrder> {
  return geminiPost<GeminiOrder>('/v1/prediction-markets/order', {
    symbol: params.symbol,
    orderType: params.orderType,
    side: params.side,
    quantity: params.quantity,
    price: params.price,
    outcome: params.outcome,
    ...(params.timeInForce ? { timeInForce: params.timeInForce } : {}),
  });
}

/**
 * Cancel an existing prediction market order.
 */
export async function cancelOrder(orderId: string): Promise<{ result: string; message: string }> {
  return geminiPost<{ result: string; message: string }>('/v1/prediction-markets/order/cancel', {
    orderId: Number(orderId),
  });
}
