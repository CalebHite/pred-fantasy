# Fantasy Prediction Markets

A Next.js web application for fantasy prediction markets where players stake money and make predictions on Gemini prediction markets. The winner takes the entire pot.

## Overview

This is a **skeleton/prototype** application built with Next.js, TypeScript, and Tailwind CSS. It includes all the core UI and state management but uses mock data for development. It's ready to be connected to a backend API and real wallet integration.

## Features

- **Wallet Connection**: Mock wallet integration (ready for real crypto wallet integration)
- **Game Creation**: Create custom games with configurable settings
  - Set buy-in amount
  - Choose prediction categories
  - Set game duration
  - Configure max participants
- **Game Joining**: Join games via unique game codes
- **Live Game View**:
  - Real-time countdown timer
  - Participant list
  - Prize pool display
  - Category overview
- **Results Page**: View winners and final standings
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Data Persistence**: localStorage (for mock data)
- **Date Handling**: date-fns

## Project Structure

```
frontend/
├── app/                           # Next.js App Router pages
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── create-game/               # Game creation
│   ├── game/[gameId]/             # Active game view
│   │   └── results/               # Game results
│   └── join/[gameCode]/           # Join game
├── components/                    # React components
│   ├── categories/                # Category selection
│   ├── game/                      # Game components
│   ├── layout/                    # Layout components
│   ├── ui/                        # Base UI components
│   └── wallet/                    # Wallet components
├── contexts/                      # React Context providers
│   ├── GameContext.tsx
│   ├── UIContext.tsx
│   ├── WalletContext.tsx
│   └── Providers.tsx
├── data/                          # Mock data
│   ├── mock-categories.ts
│   └── mock-games.ts
├── hooks/                         # Custom React hooks
│   ├── useGameTimer.ts
│   └── useLocalStorage.ts
├── lib/                           # Utilities & helpers
│   ├── game/                      # Game logic
│   ├── utils/                     # Utilities
│   └── wallet/                    # Wallet integration
└── types/                         # TypeScript definitions
    ├── category.types.ts
    ├── game.types.ts
    ├── prediction.types.ts
    ├── wallet.types.ts
    └── index.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Usage

### Connect Wallet

1. Click "Connect Wallet" in the header
2. A mock wallet will be generated with a random address
3. Set your nickname (optional)

### Create a Game

1. Navigate to "Create Game"
2. Configure game settings:
   - Buy-in amount (ETH)
   - Max participants
   - Game duration (days)
   - Rules (optional)
3. Select 2-10 prediction categories
4. Click "Create Game"
5. Share the generated game code with friends

### Join a Game

1. Enter a game code on the landing page
2. Review game details
3. Click "Join Game"
4. View the game page

## Current Limitations (Mock Data)

- **Wallet**: Uses mock wallet generation, not real crypto wallets
- **Persistence**: Data stored in localStorage, cleared on browser reset
- **Predictions**: UI placeholder, not yet functional
- **Results**: Mock data, not calculated from actual predictions
- **Backend**: No API integration, all data local

## Future Integration Points

### Backend API

The app is structured to easily integrate with a backend. Update contexts to call your API instead of using localStorage.

### Real Wallet Integration

To integrate real crypto wallets (e.g., RainbowKit):

1. Install dependencies:
```bash
npm install @rainbow-me/rainbowkit wagmi viem@2.x
```

2. Update `WalletContext.tsx` to use real wallet provider
3. Set `NEXT_PUBLIC_ENABLE_REAL_WALLET=true` in `.env.local`

## Environment Variables

See `.env.local.example` for all available environment variables:

- `NEXT_PUBLIC_APP_NAME`: App name
- `NEXT_PUBLIC_APP_URL`: App URL
- `NEXT_PUBLIC_ENABLE_REAL_WALLET`: Enable real wallet integration
- `NEXT_PUBLIC_ENABLE_BACKEND_API`: Enable backend API
- `NEXT_PUBLIC_MOCK_WALLET_ENABLED`: Enable mock wallet (dev mode)

## Key Components

### UI Components (`components/ui/`)
- **Button**: Primary, secondary, outline, ghost variants
- **Card**: Reusable card container
- **Input**: Form input with validation
- **Modal**: Accessible modal dialog
- **Toast**: Notification system
- **Spinner**: Loading indicator

### Game Components (`components/game/`)
- **GameTimer**: Countdown timer with progress bar
- **GameCodeDisplay**: Share game code
- **ParticipantsList**: Show all players

### Category Components (`components/categories/`)
- **CategorySelector**: Multi-select category grid
- **CategoryCard**: Individual category display

## State Management

React Context + Hooks pattern:
- **WalletContext**: Wallet state, connection, nickname
- **GameContext**: Game CRUD, current game
- **UIContext**: Modals, notifications

Data persisted to localStorage via `useLocalStorage` hook.

## Next Steps

1. **Backend Development**: Build API for game management and prediction storage
2. **Wallet Integration**: Integrate RainbowKit or similar for real wallet connections
3. **Gemini Integration**: Connect to Gemini prediction markets API
4. **Prediction Mechanics**: Implement actual prediction submission and tracking
5. **Game Resolution**: Build logic to calculate winners based on prediction accuracy
6. **Real-time Updates**: Add WebSocket support for live game updates
7. **Testing**: Add unit tests and integration tests
8. **Deployment**: Deploy to Vercel or similar platform

---

Built with Next.js, TypeScript, and Tailwind CSS 🚀
