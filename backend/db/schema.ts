import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const games = sqliteTable('games', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  hostAddress: text('host_address').notNull(),
  buyInAmount: real('buy_in_amount').notNull(),
  maxParticipants: integer('max_participants'),
  resolutionTime: text('resolution_time').notNull(),
  status: text('status', { enum: ['pending', 'active', 'resolving', 'completed'] }).notNull().default('pending'),
  rules: text('rules'),
  createdAt: text('created_at').notNull(),
  startedAt: text('started_at'),
  resolvedAt: text('resolved_at'),
});

export const gameEvents = sqliteTable('game_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  gameId: text('game_id').notNull().references(() => games.id),
  eventTicker: text('event_ticker').notNull(),
  eventTitle: text('event_title').notNull(),
  eventType: text('event_type', { enum: ['binary', 'categorical'] }).notNull(),
});

export const gameCategories = sqliteTable('game_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  gameId: text('game_id').notNull().references(() => games.id),
  categoryKey: text('category_key').notNull(),
  categoryName: text('category_name').notNull(),
  categoryType: text('category_type', { enum: ['crypto', 'sports', 'politics', 'entertainment'] }).notNull(),
  matchingRules: text('matching_rules').notNull(),
});

export const participants = sqliteTable('participants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  gameId: text('game_id').notNull().references(() => games.id),
  walletAddress: text('wallet_address').notNull(),
  nickname: text('nickname').notNull(),
  hasPaid: integer('has_paid', { mode: 'boolean' }).notNull().default(false),
  joinedAt: text('joined_at').notNull(),
}, (table) => [
  uniqueIndex('participant_game_wallet_idx').on(table.gameId, table.walletAddress),
]);

export const predictions = sqliteTable('predictions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  gameId: text('game_id').notNull().references(() => games.id),
  participantId: integer('participant_id').notNull().references(() => participants.id),
  categoryKey: text('category_key'),
  eventTicker: text('event_ticker').notNull(),
  eventTitle: text('event_title'), // human-readable event name
  contractTicker: text('contract_ticker').notNull(),
  contractLabel: text('contract_label'), // human-readable contract/pick name
  outcome: text('outcome', { enum: ['yes', 'no'] }).notNull(),
  entryPrice: text('entry_price'), // contract price at time of prediction (string, e.g. "0.67")
  isCorrect: integer('is_correct', { mode: 'boolean' }),
  createdAt: text('created_at').notNull(),
});

export const geminiOrders = sqliteTable('gemini_orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predictionId: integer('prediction_id').notNull().references(() => predictions.id),
  geminiOrderId: text('gemini_order_id'),
  symbol: text('symbol').notNull(),
  side: text('side', { enum: ['buy', 'sell'] }).notNull(),
  outcome: text('outcome', { enum: ['yes', 'no'] }).notNull(),
  quantity: text('quantity').notNull(),
  price: text('price').notNull(),
  status: text('status', { enum: ['pending', 'filled', 'cancelled', 'rejected'] }).notNull().default('pending'),
  avgExecutionPrice: text('avg_execution_price'),
  filledQuantity: text('filled_quantity'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
});

export const payouts = sqliteTable('payouts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  gameId: text('game_id').notNull().references(() => games.id),
  participantId: integer('participant_id').notNull().references(() => participants.id),
  amount: real('amount').notNull(),
  isWinner: integer('is_winner', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
});
