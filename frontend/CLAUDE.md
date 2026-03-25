@AGENTS.md

# Project Overview

Fantasy prediction markets app where groups pool money, make picks on Gemini prediction market events, and the person with the most correct predictions wins the payout.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS 4, React 19
- **Backend**: Separate backend folder with services, database, and Gemini API client
- **Database**: SQLite via Drizzle ORM
- **External API**: Gemini Prediction Markets

## Architecture

### Frontend (this folder)
- `app/` — Next.js pages and API routes
- `app/api/` — REST API routes that import from `../backend/` (games, events, predictions, orders, positions)
- `components/` — React UI components
- `contexts/` — React contexts for frontend state (GameContext, WalletContext, UIContext)
- `hooks/` — Custom React hooks
- `types/` — Frontend TypeScript types
- `lib/` — Frontend utilities

### Backend (`../backend/`)
- `services/` — Business logic: game CRUD, order allocation, settlement
- `services/gemini/` — Gemini API client (HMAC-SHA384 auth), wrappers for markets, trading, positions
- `db/` — Drizzle schema and SQLite client
- `drizzle/` — Database migrations
- `types/` — Backend TypeScript types (including `gemini.types.ts`)
- `utils/` — Backend utilities

## Key Conventions

- API route params must be awaited: `const { id } = await params` (Next.js 16 breaking change)
- Gemini API keys come from env vars `GEMINI_API_KEY` and `GEMINI_API_SECRET`
- Database defaults to `../frontend/data/pred-fantasy.db` (from backend perspective) — configure via `DATABASE_URL`
- Without Gemini keys, order placement runs in dry-run mode (recorded but not sent)
- Frontend API routes import backend services using relative paths: `../../../../../backend/services/...`

## Commands

### Frontend
- `npm run dev` — Start Next.js dev server
- `npm run build` — Production build
- `npm run lint` — Run ESLint

### Backend (from `../backend/` directory)
- `npm run db:generate` — Generate Drizzle migrations
- `npm run db:migrate` — Run migrations
- `npm run db:studio` — Open Drizzle Studio GUI
