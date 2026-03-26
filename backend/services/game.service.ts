import { db } from '../db';
import { games, gameEvents, participants, predictions } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { generateGameCode, generateGameId } from '../utils/game-generator';

export interface CreateGameInput {
  hostAddress: string;
  buyInAmount: number;
  maxParticipants?: number;
  resolutionTime: string; // ISO string
  rules?: string;
  events: { ticker: string; title: string; type: 'binary' | 'categorical' }[];
}

export interface JoinGameInput {
  walletAddress: string;
  nickname: string;
}

export interface SubmitPredictionsInput {
  walletAddress: string;
  picks: {
    eventTicker: string;
    contractTicker: string;
    outcome: 'yes' | 'no';
    entryPrice?: string; // contract price at time of pick (e.g. "0.67")
  }[];
}

/**
 * Create a new game with selected Gemini events.
 */
export async function createGame(input: CreateGameInput) {
  const gameId = generateGameId();
  const code = generateGameCode();
  const now = new Date().toISOString();

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

  // Insert game events
  for (const event of input.events) {
    db.insert(gameEvents).values({
      gameId,
      eventTicker: event.ticker,
      eventTitle: event.title,
      eventType: event.type,
    }).run();
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

  const events = db.select().from(gameEvents).where(eq(gameEvents.gameId, gameId)).all();
  const gameParticipants = db.select().from(participants).where(eq(participants.gameId, gameId)).all();

  return { ...game, events, participants: gameParticipants };
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

  const now = new Date().toISOString();

  // Delete existing predictions for this participant (allow re-submission)
  db.delete(predictions)
    .where(and(eq(predictions.gameId, gameId), eq(predictions.participantId, participant.id)))
    .run();

  // Insert new predictions
  for (const pick of input.picks) {
    db.insert(predictions).values({
      gameId,
      participantId: participant.id,
      eventTicker: pick.eventTicker,
      contractTicker: pick.contractTicker,
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
