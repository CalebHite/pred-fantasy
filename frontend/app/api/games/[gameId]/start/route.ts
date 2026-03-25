import { NextRequest, NextResponse } from 'next/server';
import { startGameAndPlaceOrders } from '../../../../../../backend/services/order.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { hostAddress } = body;

    if (!hostAddress) {
      return NextResponse.json(
        { error: 'Missing required field: hostAddress' },
        { status: 400 }
      );
    }

    const results = await startGameAndPlaceOrders(gameId, hostAddress);
    return NextResponse.json({ orders: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start game';
    const status = message.includes('not found') ? 404
      : message.includes('Only the host') ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
