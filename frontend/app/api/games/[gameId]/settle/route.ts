import { NextResponse } from 'next/server';
import { settleGame } from '@/lib/services/settlement.service';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const result = await settleGame(gameId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to settle game';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
