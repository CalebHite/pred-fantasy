@AGENTS.md

# Project Overview

Fantasy prediction markets app where groups pool money, make picks on Gemini prediction market events, and the person with the most correct predictions wins the payout.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS 4, React 19
- **Backend**: Next.js API routes under `app/api/`
- **Database**: SQLite via Drizzle ORM (`lib/db/`)
- **External API**: Gemini Prediction Markets (`lib/gemini/`)

## Architecture

- `lib/gemini/` — Gemini API client (HMAC-SHA384 auth), wrappers for markets, trading, positions
- `lib/services/` — Business logic: game CRUD, order allocation, settlement
- `lib/db/` — Drizzle schema and SQLite client. Migrations in `drizzle/`
- `app/api/` — REST API routes (games, events, predictions, orders, positions)
- `contexts/` — React contexts for frontend state (GameContext, WalletContext, UIContext)
- `types/` — Shared TypeScript types including `gemini.types.ts`

## Key Conventions

- API route params must be awaited: `const { id } = await params` (Next.js 16 breaking change)
- Gemini API keys come from env vars `GEMINI_API_KEY` and `GEMINI_API_SECRET`
- Database defaults to `./data/pred-fantasy.db` — configure via `DATABASE_URL`
- Without Gemini keys, order placement runs in dry-run mode (recorded but not sent)
- Feature flags in `lib/utils/constants.ts`: `ENABLE_BACKEND_API`, `ENABLE_REAL_WALLET`

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run db:generate` — Generate Drizzle migrations
- `npm run db:migrate` — Run migrations
- `npm run db:studio` — Open Drizzle Studio GUI
