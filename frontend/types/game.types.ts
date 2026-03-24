import { WalletAddress } from './wallet.types';

export type GameId = string;
export type GameCode = string;
export type GameStatus = 'pending' | 'active' | 'resolving' | 'completed';

export interface GameConfig {
  buyInAmount: number;
  categories: string[];
  maxParticipants?: number;
  resolutionTime: Date;
  rules?: string;
}

export interface Participant {
  address: WalletAddress;
  nickname: string;
  joinedAt: Date;
  hasPaid: boolean;
}

export interface Game {
  id: GameId;
  code: GameCode;
  host: WalletAddress;
  config: GameConfig;
  participants: Participant[];
  status: GameStatus;
  createdAt: Date;
  startedAt?: Date;
  resolvedAt?: Date;
}
