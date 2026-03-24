# Backend Services

This folder contains the backend logic for the prediction fantasy app, separated from the Next.js frontend.

## Structure

```
backend/
├── db/                     # Database schema and client
│   ├── index.ts           # SQLite + Drizzle setup
│   └── schema.ts          # Database schema definitions
├── services/              # Business logic
│   ├── game.service.ts    # Game CRUD operations
│   ├── order.service.ts   # Order placement and management
│   ├── settlement.service.ts  # Game settlement logic
│   └── gemini/           # Gemini API client
│       ├── client.ts      # HTTP client with HMAC-SHA384 auth
│       ├── markets.ts     # Market data endpoints
│       ├── trading.ts     # Trading endpoints
│       └── positions.ts   # Position management
├── drizzle/              # Database migrations
├── types/                # TypeScript types
│   └── gemini.types.ts   # Gemini API types
├── utils/                # Utility functions
│   └── game-generator.ts # Game ID/code generators
├── drizzle.config.ts     # Drizzle Kit configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

## Services

### Game Service (`services/game.service.ts`)
- `createGame()` - Create a new prediction game
- `getGameById()` - Fetch game details with events and participants
- `getGameByCode()` - Find game by join code
- `joinGame()` - Add participant to a game
- `submitPredictions()` - Submit participant predictions
- `getGamePredictions()` - Get predictions for a game
- `updateGameStatus()` - Update game state

### Order Service (`services/order.service.ts`)
- `startGameAndPlaceOrders()` - Lock game and place Gemini orders for all predictions
- `getGameOrders()` - Get all orders for a game

### Settlement Service (`services/settlement.service.ts`)
- `settleGame()` - Check resolved events, calculate scores, determine winners, distribute payouts
- `getGamePayouts()` - Get payout information for a completed game

### Gemini Services (`services/gemini/`)
- **Markets**: List events, get event details, list categories
- **Trading**: Place orders, cancel orders
- **Positions**: Get active/historical orders, get positions, get volume metrics
- **Client**: HMAC-SHA384 authenticated HTTP client

## Database

Uses SQLite with Drizzle ORM. Schema includes:
- `games` - Game instances
- `gameEvents` - Events selected for each game
- `participants` - Players in games
- `predictions` - Participant predictions
- `geminiOrders` - Orders placed on Gemini
- `payouts` - Game settlement results

Database file: `../frontend/data/pred-fantasy.db` (shared with frontend)

## Environment Variables

Required for Gemini API:
- `GEMINI_API_KEY` - Your Gemini API key
- `GEMINI_API_SECRET` - Your Gemini API secret
- `GEMINI_API_URL` - API base URL (defaults to sandbox)

Optional:
- `DATABASE_URL` - Custom database file path (defaults to `../frontend/data/pred-fantasy.db`)

## Commands

```bash
# Generate migrations (from schema changes)
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Usage from Frontend

The frontend API routes import these services using relative paths:

```typescript
// From frontend/app/api/games/route.ts
import { createGame, listGames } from '../../../../../backend/services/game.service';
```

## Development

1. Install dependencies: `npm install`
2. Set up environment variables (`.env.local` in frontend folder)
3. Run migrations: `npm run db:migrate`
4. Services are imported by frontend API routes automatically
