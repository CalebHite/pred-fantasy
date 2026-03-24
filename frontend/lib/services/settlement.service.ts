import { db } from '@/lib/db';
import { games, gameEvents, participants, predictions, geminiOrders, payouts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getEvent } from '@/lib/gemini/markets';

interface SettlementResult {
  gameId: string;
  totalEvents: number;
  settledEvents: number;
  unsettledEvents: string[];
  scores: { participantId: number; walletAddress: string; nickname: string; correctCount: number }[];
  winners: { participantId: number; walletAddress: string; nickname: string; payout: number }[];
  totalPool: number;
  totalReturns: number;
}

/**
 * Settle a game by checking resolved events on Gemini and calculating winners.
 */
export async function settleGame(gameId: string): Promise<SettlementResult> {
  const game = db.select().from(games).where(eq(games.id, gameId)).get();
  if (!game) throw new Error('Game not found');
  if (game.status !== 'active' && game.status !== 'resolving') {
    throw new Error('Game must be active or resolving to settle');
  }

  // Mark as resolving
  db.update(games).set({ status: 'resolving' }).where(eq(games.id, gameId)).run();

  const events = db.select().from(gameEvents).where(eq(gameEvents.gameId, gameId)).all();
  const gameParticipants = db.select().from(participants).where(eq(participants.gameId, gameId)).all();
  const allPredictions = db.select().from(predictions).where(eq(predictions.gameId, gameId)).all();

  const settledEvents: string[] = [];
  const unsettledEvents: string[] = [];

  // Check each event's resolution on Gemini
  for (const event of events) {
    try {
      const eventData = await getEvent(event.eventTicker);

      if (eventData.status === 'settled') {
        settledEvents.push(event.eventTicker);

        // Determine which contracts won
        for (const contract of eventData.contracts) {
          const winningOutcome = contract.resolutionSide; // 'yes' or 'no' or null

          // Find predictions for this contract
          const relevantPredictions = allPredictions.filter(
            p => p.eventTicker === event.eventTicker &&
              (p.contractTicker === contract.ticker || p.contractTicker === contract.instrumentSymbol)
          );

          for (const prediction of relevantPredictions) {
            const isCorrect = winningOutcome !== null && prediction.outcome === winningOutcome;

            db.update(predictions)
              .set({ isCorrect })
              .where(eq(predictions.id, prediction.id))
              .run();

            // Update the linked order status
            const order = db.select().from(geminiOrders)
              .where(eq(geminiOrders.predictionId, prediction.id))
              .get();
            if (order) {
              db.update(geminiOrders)
                .set({ status: 'filled', updatedAt: new Date().toISOString() })
                .where(eq(geminiOrders.id, order.id))
                .run();
            }
          }
        }
      } else {
        unsettledEvents.push(event.eventTicker);
      }
    } catch {
      unsettledEvents.push(event.eventTicker);
    }
  }

  // If there are unsettled events, return partial result
  if (unsettledEvents.length > 0) {
    return {
      gameId,
      totalEvents: events.length,
      settledEvents: settledEvents.length,
      unsettledEvents,
      scores: [],
      winners: [],
      totalPool: game.buyInAmount * gameParticipants.length,
      totalReturns: 0,
    };
  }

  // All events settled — calculate scores
  const updatedPredictions = db.select().from(predictions).where(eq(predictions.gameId, gameId)).all();

  const scores = gameParticipants.map(p => {
    const participantPredictions = updatedPredictions.filter(pred => pred.participantId === p.id);
    const correctCount = participantPredictions.filter(pred => pred.isCorrect === true).length;

    return {
      participantId: p.id,
      walletAddress: p.walletAddress,
      nickname: p.nickname,
      correctCount,
    };
  });

  // Sort by correct count descending
  scores.sort((a, b) => b.correctCount - a.correctCount);

  const totalPool = game.buyInAmount * gameParticipants.length;

  // Calculate actual returns from Gemini orders (contracts that resolved to $1)
  let totalReturns = 0;
  for (const prediction of updatedPredictions) {
    if (prediction.isCorrect) {
      const order = db.select().from(geminiOrders)
        .where(eq(geminiOrders.predictionId, prediction.id))
        .get();
      if (order) {
        // Each winning contract pays $1 per share
        totalReturns += parseFloat(order.filledQuantity || order.quantity);
      }
    }
  }

  // If no Gemini returns tracked (dry run mode), use pool as returns
  if (totalReturns === 0) {
    totalReturns = totalPool;
  }

  // Determine winners (highest correct count; ties split the pot)
  const maxCorrect = scores[0]?.correctCount ?? 0;
  const winnerScores = scores.filter(s => s.correctCount === maxCorrect);
  const payoutPerWinner = totalReturns / winnerScores.length;

  const now = new Date().toISOString();
  const winners = winnerScores.map(w => {
    db.insert(payouts).values({
      gameId,
      participantId: w.participantId,
      amount: payoutPerWinner,
      isWinner: true,
      createdAt: now,
    }).run();

    return {
      participantId: w.participantId,
      walletAddress: w.walletAddress,
      nickname: w.nickname,
      payout: payoutPerWinner,
    };
  });

  // Record $0 payouts for non-winners
  for (const score of scores) {
    if (!winnerScores.find(w => w.participantId === score.participantId)) {
      db.insert(payouts).values({
        gameId,
        participantId: score.participantId,
        amount: 0,
        isWinner: false,
        createdAt: now,
      }).run();
    }
  }

  // Mark game as completed
  db.update(games)
    .set({ status: 'completed', resolvedAt: now })
    .where(eq(games.id, gameId))
    .run();

  return {
    gameId,
    totalEvents: events.length,
    settledEvents: settledEvents.length,
    unsettledEvents,
    scores,
    winners,
    totalPool,
    totalReturns,
  };
}

/**
 * Get settlement/payout results for a completed game.
 */
export async function getGamePayouts(gameId: string) {
  return db.select().from(payouts).where(eq(payouts.gameId, gameId)).all();
}
