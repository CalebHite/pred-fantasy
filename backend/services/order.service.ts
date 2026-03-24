import { db } from '../db';
import { games, gameEvents, participants, predictions, geminiOrders } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { getEvent } from './gemini/markets';
import { placeOrder } from './gemini/trading';
import { isGeminiConfigured } from './gemini/client';

interface OrderResult {
  predictionId: number;
  participantAddress: string;
  eventTicker: string;
  contractTicker: string;
  outcome: string;
  geminiOrderId: string | null;
  status: string;
  quantity: string;
  price: string;
  error?: string;
}

/**
 * Start a game: lock it and place orders on Gemini for all predictions.
 * Per-participant allocation: each participant's buy-in is split evenly across events.
 */
export async function startGameAndPlaceOrders(gameId: string, hostAddress: string): Promise<OrderResult[]> {
  const game = db.select().from(games).where(eq(games.id, gameId)).get();
  if (!game) throw new Error('Game not found');
  if (game.status !== 'pending') throw new Error('Game is not in pending status');
  if (game.hostAddress !== hostAddress) throw new Error('Only the host can start the game');

  const events = db.select().from(gameEvents).where(eq(gameEvents.gameId, gameId)).all();
  if (events.length === 0) throw new Error('Game has no events');

  const gameParticipants = db.select().from(participants).where(eq(participants.gameId, gameId)).all();
  if (gameParticipants.length < 2) throw new Error('Need at least 2 participants to start');

  const allPredictions = db.select().from(predictions).where(eq(predictions.gameId, gameId)).all();
  if (allPredictions.length === 0) throw new Error('No predictions submitted yet');

  // Lock game
  const now = new Date().toISOString();
  db.update(games).set({ status: 'active', startedAt: now }).where(eq(games.id, gameId)).run();

  const budgetPerEvent = game.buyInAmount / events.length;
  const results: OrderResult[] = [];

  for (const prediction of allPredictions) {
    const participant = gameParticipants.find(p => p.id === prediction.participantId);
    if (!participant) continue;

    // Find the instrument symbol for this contract
    let instrumentSymbol = prediction.contractTicker;
    let bestAskPrice = '0.50'; // default fallback

    try {
      const eventData = await getEvent(prediction.eventTicker);
      const contract = eventData.contracts.find(c =>
        c.ticker === prediction.contractTicker || c.instrumentSymbol.includes(prediction.contractTicker)
      );
      if (contract) {
        instrumentSymbol = contract.instrumentSymbol;
        bestAskPrice = String(contract.prices.bestAsk || 0.50);
      }
    } catch {
      // If we can't fetch event data, use the contract ticker as-is
    }

    const price = bestAskPrice;
    const priceNum = parseFloat(price);
    const quantity = String(Math.floor(budgetPerEvent / priceNum));

    if (parseInt(quantity) <= 0) {
      results.push({
        predictionId: prediction.id,
        participantAddress: participant.walletAddress,
        eventTicker: prediction.eventTicker,
        contractTicker: prediction.contractTicker,
        outcome: prediction.outcome,
        geminiOrderId: null,
        status: 'rejected',
        quantity: '0',
        price,
        error: 'Insufficient budget for this event at current price',
      });
      continue;
    }

    type OrderStatus = 'pending' | 'filled' | 'cancelled' | 'rejected';
    let geminiOrderId: string | null = null;
    let orderStatus: OrderStatus = 'pending';
    let error: string | undefined;

    if (isGeminiConfigured()) {
      try {
        const order = await placeOrder({
          symbol: instrumentSymbol,
          orderType: 'limit',
          side: 'buy',
          quantity,
          price,
          outcome: prediction.outcome as 'yes' | 'no',
          timeInForce: 'good-til-cancel',
        });
        geminiOrderId = order.orderId;
        orderStatus = (order.status as OrderStatus) || 'pending';
      } catch (e) {
        orderStatus = 'rejected';
        error = e instanceof Error ? e.message : 'Unknown error placing order';
      }
    } else {
      // No Gemini keys — record the order as pending (dry run)
      orderStatus = 'pending';
    }

    // Record the order in our database
    db.insert(geminiOrders).values({
      predictionId: prediction.id,
      geminiOrderId,
      symbol: instrumentSymbol,
      side: 'buy',
      outcome: prediction.outcome,
      quantity,
      price,
      status: orderStatus,
      createdAt: now,
      updatedAt: now,
    }).run();

    results.push({
      predictionId: prediction.id,
      participantAddress: participant.walletAddress,
      eventTicker: prediction.eventTicker,
      contractTicker: prediction.contractTicker,
      outcome: prediction.outcome,
      geminiOrderId,
      status: orderStatus,
      quantity,
      price,
      error,
    });
  }

  return results;
}

/**
 * Get all orders for a game.
 */
export async function getGameOrders(gameId: string) {
  const gamePredictions = db.select().from(predictions).where(eq(predictions.gameId, gameId)).all();
  const predictionIds = gamePredictions.map(p => p.id);

  if (predictionIds.length === 0) return [];

  const orders = [];
  for (const predId of predictionIds) {
    const orderRows = db.select().from(geminiOrders).where(eq(geminiOrders.predictionId, predId)).all();
    orders.push(...orderRows);
  }

  return orders;
}
