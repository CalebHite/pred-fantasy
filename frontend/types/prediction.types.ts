import { WalletAddress } from './wallet.types';
import { GameId } from './game.types';
import { CategoryId } from './category.types';

export interface Prediction {
  id: string;
  gameId: GameId;
  participantAddress: WalletAddress;
  categoryId: CategoryId;
  selectedOption: string;
  confidence?: number;
  timestamp: Date;
}

export interface PredictionResult {
  predictionId: string;
  isCorrect: boolean;
  points?: number;
}
