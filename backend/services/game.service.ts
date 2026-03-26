import { db } from '../db';
import { games, gameEvents, gameCategories, participants, predictions } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { generateGameCode, generateGameId } from '../utils/game-generator';
import { getCategoryByKey, eventMatchesCategory } from './category.service';
import { getEvent } from './gemini/markets';

export interface CreateGameInput {
  hostAddress: string;
  buyInAmount: number;
  maxParticipants?: number;
  resolutionTime: string; // ISO string
  rules?: string;
  categories: { categoryKey: string; categoryName: string; categoryType: string }[];
  events?: { ticker: string; title: string; type: 'binary' | 'categorical' }[]; // Legacy support
}

export interface JoinGameInput {
  walletAddress: string;
  nickname: string;
}

export interface SubmitPredictionsInput {
  walletAddress: string;
  picks: {
    categoryKey: string;
    eventTicker: string;
    contractTicker: string;
    outcome: 'yes' | 'no';
    entryPrice?: string; // contract price at time of pick (e.g. "0.67")
  }[];
}

/**
 * Create a new game with selected categories.
 */
export async function createGame(input: CreateGameInput) {
  const gameId = generateGameId();
  const code = generateGameCode();
  const now = new Date().toISOString();

  // Validate categories
  if (!input.categories || input.categories.length === 0) {
    // Legacy support: check for events
    if (!input.events || input.events.length === 0) {
      throw new Error('At least one category or event is required');
    }
  }

  // Insert game
  db.insert(games).values({
    id: gameId,
    code,
    hostAddress: input.hostAddress,
    buyInAmount: input.buyInAmount,
    maxParticipants: input.maxParticipants ?? null,
    resolutionTime: input.resolutionTime,
    status: 'pending',
    rules: input.rules ?? null,
    createdAt: now,
  }).run();

  // Insert game categories (new system)
  if (input.categories && input.categories.length > 0) {
    for (const category of input.categories) {
      const categoryDef = getCategoryByKey(category.categoryKey);
      if (!categoryDef) {
        throw new Error(`Invalid category: ${category.categoryKey}`);
      }

      db.insert(gameCategories).values({
        gameId,
        categoryKey: category.categoryKey,
        categoryName: category.categoryName,
        categoryType: category.categoryType,
        matchingRules: JSON.stringify(categoryDef.matchingRules),
      }).run();
    }
  }

  // Insert game events (legacy system)
  if (input.events && input.events.length > 0) {
    for (const event of input.events) {
      db.insert(gameEvents).values({
        gameId,
        eventTicker: event.ticker,
        eventTitle: event.title,
        eventType: event.type,
      }).run();
    }
  }

  // Add host as first participant
  db.insert(participants).values({
    gameId,
    walletAddress: input.hostAddress,
    nickname: 'Host',
    hasPaid: true,
    joinedAt: now,
  }).run();

  return getGameById(gameId);
}

/**
 * Get a game by ID with all related data.
 */
export async function getGameById(gameId: string) {
  const game = db.select().from(games).where(eq(games.id, gameId)).get();
  if (!game) return null;

  // Try categories first (new system)
  const categories = db.select().from(gameCategories).where(eq(gameCategories.gameId, gameId)).all();

  // Fallback to events (legacy system)
  const events = db.select().from(gameEvents).where(eq(gameEvents.gameId, gameId)).all();

  const gameParticipants = db.select().from(participants).where(eq(participants.gameId, gameId)).all();

  return {
    ...game,
    categories,
    events, // Keep for backward compatibility
    participants: gameParticipants
  };
}

/**
 * Get a game by join code.
 */
export async function getGameByCode(code: string) {
  const game = db.select().from(games).where(eq(games.code, code.toUpperCase())).get();
  if (!game) return null;
  return getGameById(game.id);
}

/**
 * List all games, optionally filtered by status.
 */
type GameStatus = 'pending' | 'active' | 'resolving' | 'completed';

export async function listGames(status?: string) {
  const allGames = status
    ? db.select().from(games).where(eq(games.status, status as GameStatus)).all()
    : db.select().from(games).all();

  return Promise.all(allGames.map(g => getGameById(g.id)));
}

/**
 * Join a game as a participant.
 */
export async function joinGame(gameId: string, input: JoinGameInput) {
  const game = db.select().from(games).where(eq(games.id, gameId)).get();
  if (!game) throw new Error('Game not found');
  if (game.status !== 'pending') throw new Error('Game is not accepting new participants');

  // Check if already joined
  const existing = db.select().from(participants)
    .where(and(eq(participants.gameId, gameId), eq(participants.walletAddress, input.walletAddress)))
    .get();
  if (existing) throw new Error('Already joined this game');

  // Check max participants
  if (game.maxParticipants) {
    const count = db.select().from(participants).where(eq(participants.gameId, gameId)).all().length;
    if (count >= game.maxParticipants) throw new Error('Game is full');
  }

  db.insert(participants).values({
    gameId,
    walletAddress: input.walletAddress,
    nickname: input.nickname,
    hasPaid: true,
    joinedAt: new Date().toISOString(),
  }).run();

  return getGameById(gameId);
}

/**
 * Submit predictions for a participant.
 */
export async function submitPredictions(gameId: string, input: SubmitPredictionsInput) {
  const game = db.select().from(games).where(eq(games.id, gameId)).get();
  if (!game) throw new Error('Game not found');
  if (game.status !== 'pending') throw new Error('Game is not accepting predictions');

  const participant = db.select().from(participants)
    .where(and(eq(participants.gameId, gameId), eq(participants.walletAddress, input.walletAddress)))
    .get();
  if (!participant) throw new Error('Not a participant in this game');

  // Get game categories for validation
  const gameCategs = db.select().from(gameCategories).where(eq(gameCategories.gameId, gameId)).all();
  const validCategoryKeys = new Set(gameCategs.map(c => c.categoryKey));

  const now = new Date().toISOString();

  // Pre-fetch event data (used for both validation and storing human-readable names)
  const eventDataCache = new Map<string, Awaited<ReturnType<typeof getEvent>>>();
  for (const pick of input.picks) {
    if (!eventDataCache.has(pick.eventTicker)) {
      try {
        const eventData = await getEvent(pick.eventTicker);
        eventDataCache.set(pick.eventTicker, eventData);
      } catch {
        // Will be caught during validation below
      }
    }
  }

  // Validate picks if using category system
  if (gameCategs.length > 0) {
    for (const pick of input.picks) {
      // Validate category belongs to game
      if (!validCategoryKeys.has(pick.categoryKey)) {
        throw new Error(`Category ${pick.categoryKey} is not part of this game`);
      }

      // Validate event belongs to category
      const category = getCategoryByKey(pick.categoryKey);
      if (!category) {
        throw new Error(`Invalid category: ${pick.categoryKey}`);
      }

      const eventData = eventDataCache.get(pick.eventTicker);
      if (!eventData) {
        throw new Error(`Event not found: ${pick.eventTicker}`);
      }

      // Check if event matches category
      if (!eventMatchesCategory(eventData, category)) {
        throw new Error(
          `Event ${pick.eventTicker} does not belong to category ${pick.categoryKey}`
        );
      }

      // Check if event is active
      if (eventData.status !== 'active' && eventData.status !== 'approved') {
        throw new Error(`Event ${pick.eventTicker} is not active (status: ${eventData.status})`);
      }

      // Validate contract exists in event
      const contract = eventData.contracts.find(
        c => c.ticker === pick.contractTicker || c.instrumentSymbol === pick.contractTicker
      );
      if (!contract) {
        throw new Error(`Contract ${pick.contractTicker} not found in event ${pick.eventTicker}`);
      }
    }

    // Validate: One pick per category
    const categoryCounts = new Map<string, number>();
    for (const pick of input.picks) {
      categoryCounts.set(pick.categoryKey, (categoryCounts.get(pick.categoryKey) || 0) + 1);
    }
    for (const [categoryKey, count] of categoryCounts.entries()) {
      if (count > 1) {
        throw new Error(`Multiple picks for category ${categoryKey}. Only one pick per category allowed.`);
      }
    }
  }

  // Delete existing predictions for this participant (allow re-submission)
  db.delete(predictions)
    .where(and(eq(predictions.gameId, gameId), eq(predictions.participantId, participant.id)))
    .run();

  // Insert new predictions
  for (const pick of input.picks) {
    const eventData = eventDataCache.get(pick.eventTicker);
    const contract = eventData?.contracts.find(
      c => c.ticker === pick.contractTicker || c.instrumentSymbol === pick.contractTicker
    );

    db.insert(predictions).values({
      gameId,
      participantId: participant.id,
      categoryKey: pick.categoryKey || null,
      eventTicker: pick.eventTicker,
      eventTitle: eventData?.title ?? null,
      contractTicker: pick.contractTicker,
      contractLabel: contract?.label ?? null,
      outcome: pick.outcome,
      entryPrice: pick.entryPrice ?? null,
      createdAt: now,
    }).run();
  }

  return db.select().from(predictions)
    .where(and(eq(predictions.gameId, gameId), eq(predictions.participantId, participant.id)))
    .all();
}

/**
 * Get predictions for a game, optionally filtered by participant.
 */
export async function getGamePredictions(gameId: string, walletAddress?: string) {
  if (walletAddress) {
    const participant = db.select().from(participants)
      .where(and(eq(participants.gameId, gameId), eq(participants.walletAddress, walletAddress)))
      .get();
    if (!participant) return [];

    return db.select().from(predictions)
      .where(and(eq(predictions.gameId, gameId), eq(predictions.participantId, participant.id)))
      .all();
  }

  return db.select().from(predictions).where(eq(predictions.gameId, gameId)).all();
}

/**
 * Update game status.
 */
export async function updateGameStatus(gameId: string, status: GameStatus, extraFields?: Record<string, string>) {
  db.update(games)
    .set({ status, ...extraFields })
    .where(eq(games.id, gameId))
    .run();

  return getGameById(gameId);
}
